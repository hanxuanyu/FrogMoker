package com.hxuanyu.frogmocker.service.processor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class XmlMessageContentProcessor implements MessageContentProcessor {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]+)}");

    @Override
    public String getMessageType() {
        return "XML";
    }

    @Override
    public String format(String content) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)));
            document.normalize();

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));
            String formatted = writer.toString();
            log.debug("Formatted XML content successfully. originalLength={}, formattedLength={}",
                    safeLength(content), safeLength(formatted));
            return formatted;
        } catch (Exception e) {
            log.warn("Failed to format XML content, returning original content. contentLength={}", safeLength(content), e);
            return content;
        }
    }

    @Override
    public List<String> parseVariables(String content) {
        List<String> variables = new ArrayList<String>();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            if (!variables.contains(variableName)) {
                variables.add(variableName);
            }
        }
        log.debug("Parsed XML template variables. count={}, variables={}", variables.size(), variables);
        return variables;
    }

    @Override
    public String render(String content, Map<String, String> variables) {
        StringBuffer buffer = new StringBuffer();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(content);
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            String value = variables.getOrDefault(variableName, matcher.group(0));
            matcher.appendReplacement(buffer, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(buffer);
        String rendered = buffer.toString();
        log.debug("Rendered XML template content. variableCount={}, outputLength={}",
                variables.size(), safeLength(rendered));
        return rendered;
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }
}

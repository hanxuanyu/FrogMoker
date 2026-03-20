package com.hxuanyu.frogmocker.service.server;

/**
 * 服务端启动异常
 */
public class ServerStartException extends Exception {

    public ServerStartException(String message) {
        super(message);
    }

    public ServerStartException(String message, Throwable cause) {
        super(message, cause);
    }
}

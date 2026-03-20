package com.hxuanyu.frogmocker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hxuanyu.frogmocker.entity.RequestLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 请求日志 Mapper
 */
@Mapper
public interface RequestLogMapper extends BaseMapper<RequestLog> {
}

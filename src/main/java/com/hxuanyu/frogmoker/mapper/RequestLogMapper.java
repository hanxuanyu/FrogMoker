package com.hxuanyu.frogmoker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hxuanyu.frogmoker.entity.RequestLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 请求日志 Mapper
 */
@Mapper
public interface RequestLogMapper extends BaseMapper<RequestLog> {
}

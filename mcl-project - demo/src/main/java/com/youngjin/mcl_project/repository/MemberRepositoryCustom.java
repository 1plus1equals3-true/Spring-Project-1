package com.youngjin.mcl_project.repository;

import com.youngjin.mcl_project.entity.MemberEntity;

import java.util.List;

public interface MemberRepositoryCustom {
    List<MemberEntity> searchMembers(String userid, String nickname);
}

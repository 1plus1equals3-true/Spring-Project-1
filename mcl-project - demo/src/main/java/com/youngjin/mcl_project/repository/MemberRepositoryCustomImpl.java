package com.youngjin.mcl_project.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.youngjin.mcl_project.entity.MemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.youngjin.mcl_project.entity.QMemberEntity.memberEntity;

@Repository
@RequiredArgsConstructor
public class MemberRepositoryCustomImpl implements MemberRepositoryCustom {
// 쿼리 if 처럼 동적으로 사용하기

    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public List<MemberEntity> searchMembers(String userid, String nickname) {

        BooleanExpression sql = null;

        if (userid != null && nickname != null) {
            sql = memberEntity.userid.eq(userid).or(memberEntity.nickname.eq(nickname));
        }else if (userid != null) {
            sql = memberEntity.userid.eq(userid);
        }else if (nickname != null) {
            sql = memberEntity.nickname.eq(nickname);
        }

        return jpaQueryFactory.selectFrom(memberEntity).where(sql).fetch();
    }

}

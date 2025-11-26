package com.youngjin.mcl_project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.youngjin.mcl_project.entity.PokeSampleEntity;
import com.youngjin.mcl_project.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PokeSampleResponseDTO {
    private Long idx;
    //private Long memberIdx;
    private String authorNickname; // 작성자 닉네임
    private Integer pokemonIdx;
    private String pokemonName;

    // 스펙
    private String teraType;
    private String item;
    private String nature;
    private String ability;
    private String ivs;
    private String evs;

    // 기술
    private String move1;
    private String move2;
    private String move3;
    private String move4;

    private String description;
    private Visibility visibility;

    // 통계 및 날짜
    private Integer likeCount;
    private LocalDateTime regdate;
    private LocalDateTime moddate;
    private Integer hit;       // 조회수
    private Long commentCount;

    // 로그인한 사용자의 상태
    @JsonProperty("isLiked")
    private boolean isLiked;   // 내가 좋아요 눌렀는지?

    @JsonProperty("isMine")
    private boolean isMine;    // 내 글인지? (프론트 수정/삭제 버튼 제어용)

    // Entity -> DTO 변환 생성자 (Service에서 깔끔하게 쓰기 위해)
    public static PokeSampleResponseDTO fromEntity(PokeSampleEntity entity, String nickname, boolean isLiked, boolean isMine, Long commentCount) {
        return PokeSampleResponseDTO.builder()
                .idx(entity.getIdx())
                .authorNickname(nickname) // 닉네임 주입
                .pokemonIdx(entity.getPokemonIdx())
                .pokemonName(entity.getPokemonName())
                .teraType(entity.getTeraType())
                .item(entity.getItem())
                .nature(entity.getNature())
                .ability(entity.getAbility())
                .ivs(entity.getIvs())
                .evs(entity.getEvs())
                .move1(entity.getMove1())
                .move2(entity.getMove2())
                .move3(entity.getMove3())
                .move4(entity.getMove4())
                .description(entity.getDescription())
                .visibility(entity.getVisibility())
                .likeCount(entity.getLikeCount())
                .hit(entity.getHit()) // 조회수
                .commentCount(commentCount)
                .isLiked(isLiked)
                .isMine(isMine)
                .regdate(entity.getRegdate())
                .moddate(entity.getModdate())
                .build();
    }
}
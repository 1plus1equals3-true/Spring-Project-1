package com.youngjin.mcl_project.dto;

import com.youngjin.mcl_project.entity.PokeSample;
import com.youngjin.mcl_project.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PokeSampleRequestDTO {
    // 작성자 ID는 보통 토큰에서 꺼내지만, DTO에 포함해둡니다.
    private Long memberIdx;

    private Integer pokemonIdx;
    private String pokemonName;

    private String teraType;
    private String item;
    private String nature;
    private String ability;
    private String ivs;
    private String evs;

    private String move1;
    private String move2;
    private String move3;
    private String move4;

    private String description;
    private Visibility visibility; // PUBLIC or PRIVATE

    // DTO -> Entity 변환 메서드 (편의성)
    public PokeSample toEntity() {
        return PokeSample.builder()
                .memberIdx(this.memberIdx)
                .pokemonIdx(this.pokemonIdx)
                .pokemonName(this.pokemonName)
                .teraType(this.teraType)
                .item(this.item)
                .nature(this.nature)
                .ability(this.ability)
                .ivs(this.ivs)
                .evs(this.evs)
                .move1(this.move1)
                .move2(this.move2)
                .move3(this.move3)
                .move4(this.move4)
                .description(this.description)
                .visibility(this.visibility == null ? Visibility.PUBLIC : this.visibility)
                .build();
    }
}
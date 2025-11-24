package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;
import com.youngjin.mcl_project.enums.Visibility;

import java.time.LocalDateTime;

@Entity
@Table(name = "poke_sample", indexes = {
        @Index(name = "idx_pokemon_idx", columnList = "pokemonIdx"),
        @Index(name = "idx_member_idx", columnList = "memberIdx")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@DynamicInsert // insert 시 null인 필드는 제외 -> DB의 Default 값 적용됨
public class PokeSampleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(name = "member_idx", nullable = false)
    private Long memberIdx;

    @Column(name = "pokemon_idx", nullable = false)
    private Integer pokemonIdx; // 전국도감 번호

    @Column(name = "pokemon_name", nullable = false, length = 50)
    private String pokemonName; // 검색용 이름

    // --- 상세 스펙 ---
    @Column(name = "tera_type", nullable = false, length = 20)
    private String teraType;

    @Column(nullable = false, length = 50)
    private String item;

    @Column(nullable = false, length = 20)
    private String nature; // 성격

    @Column(nullable = false, length = 50)
    private String ability; // 특성

    @Column(nullable = false, length = 50)
    private String ivs; // 개체값

    @Column(nullable = false, length = 50)
    private String evs; // 노력치

    // --- 기술 배치 ---
    @Column(nullable = false, length = 50)
    private String move1;
    @Column(nullable = false, length = 50)
    private String move2;
    @Column(nullable = false, length = 50)
    private String move3;
    @Column(nullable = false, length = 50)
    private String move4;

    @Column(columnDefinition = "TEXT")
    private String description; // 운용법

    // --- 관리 필드 ---
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'PUBLIC'") // DDL 생성시 기본값
    private Visibility visibility;

    @Column(name = "like_count", nullable = false)
    @ColumnDefault("0")
    private Integer likeCount; // 좋아요 수 캐싱

    @Column(name = "hit", nullable = false)
    @ColumnDefault("0")
    private Integer hit;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime regdate;

    @UpdateTimestamp
    private LocalDateTime moddate;

    // ⭐️ 추가: 삭제 여부 필드
    @Column(name = "is_deleted", nullable = false)
    @ColumnDefault("false") // 0
    private boolean isDeleted;

    // --- 비즈니스 로직 편의 메서드 ---

    // 좋아요 수 증가
    public void increaseLikeCount() {
        this.likeCount++;
    }

    // 좋아요 수 감소
    public void decreaseLikeCount() {
        this.likeCount = Math.max(0, this.likeCount - 1);
    }

    // 조회수 증가
    public void increaseHit() {
        this.hit++;
    }

    public void changeDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public void updateSampleInfo(String teraType, String item, String nature, String ability,
                                 String ivs, String evs, String move1, String move2, String move3, String move4,
                                 String description, Visibility visibility) {
        this.teraType = teraType;
        this.item = item;
        this.nature = nature;
        this.ability = ability;
        this.ivs = ivs;
        this.evs = evs;
        this.move1 = move1;
        this.move2 = move2;
        this.move3 = move3;
        this.move4 = move4;
        this.description = description;
        this.visibility = visibility;
    }
}
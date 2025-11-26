package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "poke_sample_comment")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"pokeSample", "parent", "replies"}) // 무한 루프 방지
@DynamicInsert
public class PokeSampleComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    // ⭐️ 어떤 샘플에 달린 댓글인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poke_sample_idx", nullable = false)
    private PokeSampleEntity pokeSample;

    @Column(name = "member_idx", nullable = false)
    private Long memberIdx;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ment;

    // ⭐️ 대댓글 구조 (Self-Referencing)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_idx")
    private PokeSampleComment parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @OrderBy("idx ASC") // 대댓글은 작성 순서대로
    private List<PokeSampleComment> replies = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    @ColumnDefault("false")
    private boolean isDeleted;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime regdate;

    @UpdateTimestamp
    private LocalDateTime moddate;

    // 내용 수정 메서드
    public void updateMent(String ment) {
        this.ment = ment;
    }

    // 삭제 처리 메서드 (Soft Delete)
    public void changeDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
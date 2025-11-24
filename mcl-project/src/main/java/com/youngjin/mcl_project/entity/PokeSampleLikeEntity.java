package com.youngjin.mcl_project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "poke_sample_like")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "pokeSample") // 무한루프 방지
public class PokeSampleLikeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    // 어떤 샘플인가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sample_idx", nullable = false)
    private PokeSampleEntity pokeSample;

    // 누가 눌렀는가
    @Column(name = "member_idx", nullable = false)
    private Long memberIdx;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime regdate;
}
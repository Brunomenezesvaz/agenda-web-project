package com.agenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "atendimentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Data é obrigatória")
    private LocalDate data;

    private LocalTime horario;

    @NotBlank(message = "Texto do problema é obrigatório")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String problemaTexto;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "atendimento_receitas", joinColumns = @JoinColumn(name = "atendimento_id"))
    @Column(name = "receita")
    private List<String> receitaSaude = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profissional_id", nullable = false)
    private ProfissionalDeSaude profissional;

    @OneToMany(mappedBy = "atendimento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ExameLab> exames = new ArrayList<>();

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();

    public void setExames(List<ExameLab> exames) {
        this.exames = exames;
        if (exames != null) {
            for (ExameLab exame : exames) {
                exame.setAtendimento(this);
            }
        }
    }
}

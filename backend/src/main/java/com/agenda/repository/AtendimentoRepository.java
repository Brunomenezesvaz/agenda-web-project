package com.agenda.repository;

import com.agenda.model.Atendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    List<Atendimento> findAllByOrderByDataAscHorarioAsc();

    List<Atendimento> findByProfissionalIdOrderByDataAscHorarioAsc(Long profissionalId);
}

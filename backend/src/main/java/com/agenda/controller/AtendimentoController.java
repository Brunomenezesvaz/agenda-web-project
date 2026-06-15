package com.agenda.controller;

import com.agenda.model.Atendimento;
import com.agenda.repository.AtendimentoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/atendimentos")
@CrossOrigin(origins = "*")
public class AtendimentoController {

    private final AtendimentoRepository repository;

    public AtendimentoController(AtendimentoRepository repository) {
        this.repository = repository;
    }

    // CREATE - Inserir
    @PostMapping
    public ResponseEntity<Atendimento> criar(@Valid @RequestBody Atendimento atendimento) {
        Atendimento salvo = repository.save(atendimento);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // READ - Listar todos
    @GetMapping
    public ResponseEntity<List<Atendimento>> listar(@RequestParam(required = false) Long profissionalId) {
        List<Atendimento> atendimentos;
        if (profissionalId != null) {
            atendimentos = repository.findByProfissionalIdOrderByDataAscHorarioAsc(profissionalId);
        } else {
            atendimentos = repository.findAllByOrderByDataAscHorarioAsc();
        }
        return ResponseEntity.ok(atendimentos);
    }

    // READ - Consultar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Atendimento> buscar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE - Alterar (id)
    @PutMapping("/{id}")
    public ResponseEntity<Atendimento> atualizar(@PathVariable Long id,
                                                 @Valid @RequestBody Atendimento dados) {
        return repository.findById(id)
                .map(atendimento -> {
                    atendimento.setData(dados.getData());
                    atendimento.setHorario(dados.getHorario());
                    atendimento.setProblemaTexto(dados.getProblemaTexto());
                    atendimento.setReceitaSaude(dados.getReceitaSaude());
                    atendimento.setProfissional(dados.getProfissional());
                    
                    // Update nested exames
                    atendimento.getExames().clear();
                    if (dados.getExames() != null) {
                        atendimento.setExames(dados.getExames());
                    }
                    
                    return ResponseEntity.ok(repository.save(atendimento));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Excluir (id)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return repository.findById(id)
                .map(atendimento -> {
                    repository.delete(atendimento);
                    return ResponseEntity.ok(Map.of("mensagem", "Atendimento removido com sucesso"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

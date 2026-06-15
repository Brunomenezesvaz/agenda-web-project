package com.agenda;

import com.agenda.controller.AtendimentoController;
import com.agenda.model.Atendimento;
import com.agenda.model.ProfissionalDeSaude;
import com.agenda.repository.AtendimentoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AtendimentoController.class)
public class AtendimentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AtendimentoRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    private Atendimento a1;
    private ProfissionalDeSaude p1;

    @BeforeEach
    void setUp() {
        p1 = new ProfissionalDeSaude(1L, "João Silva", "11999999999", "Rua A, 123", "Médico", null);
        List<String> receitas = Arrays.asList("Remédio 1 ao dia", "Evitar esforço");
        a1 = new Atendimento(1L, LocalDate.now(), LocalTime.of(14, 30), "Dor de cabeça constante", receitas, p1, new ArrayList<>(), null);
    }

    @Test
    void deveCriarAtendimentoComSucesso() throws Exception {
        Mockito.when(repository.save(any(Atendimento.class))).thenReturn(a1);

        mockMvc.perform(post("/api/atendimentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(a1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.problemaTexto", is("Dor de cabeça constante")))
                .andExpect(jsonPath("$.profissional.nome", is("João Silva")));
    }

    @Test
    void deveListarTodosOsAtendimentos() throws Exception {
        Mockito.when(repository.findAllByOrderByDataAscHorarioAsc()).thenReturn(Arrays.asList(a1));

        mockMvc.perform(get("/api/atendimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].problemaTexto", is("Dor de cabeça constante")));
    }

    @Test
    void deveBuscarAtendimentoPorId() throws Exception {
        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(a1));

        mockMvc.perform(get("/api/atendimentos/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.problemaTexto", is("Dor de cabeça constante")));
    }

    @Test
    void deveDeletarAtendimentoComSucesso() throws Exception {
        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(a1));

        mockMvc.perform(delete("/api/atendimentos/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", is("Atendimento removido com sucesso")));
    }
}

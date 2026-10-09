package com.velo.magasin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MagasinApplicationTests {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Test
    void refuseLesRequetesSansJeton() throws Exception {
        mvc.perform(get("/api/stocks")).andExpect(status().isUnauthorized());
    }

    @Test
    void refuseUnMauvaisMotDePasse() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"faux\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unVendeurVoitSonStockEtVend() throws Exception {
        String token = login("vend.paris1");
        JsonNode stock = getJson("/api/stocks", token);
        assertThat(stock).allSatisfy(s -> assertThat(s.get("magasinNom").asText()).isEqualTo("Magasin Paris"));
        long veloId = produitId(stock, "V-VILLE");
        int avant = quantite(stock, "V-VILLE");

        mvc.perform(post("/api/ventes").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"client\":\"M. Client\",\"lignes\":[{\"produitId\":" + veloId + ",\"quantite\":1}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(549.0));

        assertThat(quantite(getJson("/api/stocks", token), "V-VILLE")).isEqualTo(avant - 1);
    }

    @Test
    void uneVenteAuDelaDuStockEstRefusee() throws Exception {
        String token = login("vend.paris1");
        long veloId = produitId(getJson("/api/stocks", token), "V-VTT");
        mvc.perform(post("/api/ventes").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lignes\":[{\"produitId\":" + veloId + ",\"quantite\":99}]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unVendeurNePeutPasConsulterUnAutreMagasinNiAssembler() throws Exception {
        String token = login("vend.paris1");
        mvc.perform(get("/api/stocks?magasinId=1").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(post("/api/assemblages").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                .content("{\"veloId\":1,\"quantite\":1}")).andExpect(status().isForbidden());
    }

    @Test
    void lAssemblageConsommeLesPiecesDuStockCentral() throws Exception {
        String token = login("resp.central");
        JsonNode stock = getJson("/api/stocks", token);
        long veloId = produitId(stock, "V-VILLE");
        int velosAvant = quantite(stock, "V-VILLE");
        int rouesAvant = quantite(stock, "P-ROU-28");

        mvc.perform(post("/api/assemblages").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"veloId\":" + veloId + ",\"quantite\":3}"))
                .andExpect(status().isCreated());

        JsonNode apres = getJson("/api/stocks", token);
        assertThat(quantite(apres, "V-VILLE")).isEqualTo(velosAvant + 3);
        assertThat(quantite(apres, "P-ROU-28")).isEqualTo(rouesAvant - 6);
    }

    @Test
    void transfertDemandeParUneBoutiqueEtValideParLUsine() throws Exception {
        String respParis = login("resp.paris");
        long vttId = produitId(getJson("/api/stocks", respParis), "V-VTT");
        int avant = quantite(getJson("/api/stocks", respParis), "V-VTT");

        JsonNode transfert = json.readTree(mvc.perform(post("/api/transferts").header("Authorization", respParis)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"produitId\":" + vttId + ",\"quantite\":2}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());

        // une boutique ne peut pas valider sa propre demande
        mvc.perform(post("/api/transferts/" + transfert.get("id").asLong() + "/validation").header("Authorization", respParis))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/transferts/" + transfert.get("id").asLong() + "/validation")
                        .header("Authorization", login("resp.central")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("VALIDE"));

        assertThat(quantite(getJson("/api/stocks", respParis), "V-VTT")).isEqualTo(avant + 2);
    }

    @Test
    void laReceptionDUneCommandeAlimenteLeStockCentral() throws Exception {
        String token = login("admin");
        JsonNode stockCentral = getJson("/api/stocks?magasinId=1", token);
        long pneuId = produitId(stockCentral, "P-PNE-01");
        int avant = quantite(stockCentral, "P-PNE-01");
        long fournisseurId = getJson("/api/fournisseurs", token).get(0).get("id").asLong();

        JsonNode commande = json.readTree(mvc.perform(post("/api/commandes").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fournisseurId\":" + fournisseurId + ",\"lignes\":[{\"pieceId\":" + pneuId
                                + ",\"quantite\":50,\"prixUnitaire\":9.5}]}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());

        mvc.perform(post("/api/commandes/" + commande.get("id").asLong() + "/reception").header("Authorization", token))
                .andExpect(jsonPath("$.statut").value("RECUE"));

        assertThat(quantite(getJson("/api/stocks?magasinId=1", token), "P-PNE-01")).isEqualTo(avant + 50);
    }

    private String login(String username) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private JsonNode getJson(String url, String token) throws Exception {
        return json.readTree(mvc.perform(get(url).header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
    }

    private static JsonNode ligne(JsonNode stock, String reference) {
        for (JsonNode s : stock) {
            if (s.get("produitReference").asText().equals(reference)) {
                return s;
            }
        }
        throw new AssertionError("Référence absente du stock : " + reference);
    }

    private static long produitId(JsonNode stock, String reference) {
        return ligne(stock, reference).get("produitId").asLong();
    }

    private static int quantite(JsonNode stock, String reference) {
        return ligne(stock, reference).get("quantite").asInt();
    }
}

const UF_NAMES = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

export async function geocodeBrazilCity(cidade, uf) {
  const cleanCidade = String(cidade || "").trim();
  const cleanUf = String(uf || "")
    .trim()
    .toUpperCase();

  if (!cleanCidade || !cleanUf) return null;

  const cacheKey = `geo_${cleanCidade.toLowerCase()}_${cleanUf}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const estadoNome = UF_NAMES[cleanUf] || cleanUf;
  const query = encodeURIComponent(`${cleanCidade}, ${estadoNome}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=br&limit=1&q=${query}`;

  const response = await fetch(url, {
    headers: {
      // A política de uso da API Nominatim recomenda um User-Agent customizado
      "User-Agent": "MuralBrasil/1.0 (lucdev0001@github)",
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data) || !data.length) return null;

  const first = data[0];

  const result = {
    lat: Number(first.lat),
    lng: Number(first.lon),
    municipio: cleanCidade,
    estado: cleanUf,
    estadoNome,
  };

  if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) return null;

  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MuralBrasil/1.0 (lucdev0001@github)",
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.address) return null;

    const address = data.address;
    // O Nominatim pode retornar o nome da cidade em diferentes propriedades
    const cidade =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";
    const estadoNome = address.state || "";

    // Busca a sigla UF (ex: SP) através do nome do estado
    let uf = "";
    for (const [key, value] of Object.entries(UF_NAMES)) {
      if (value.toLowerCase() === estadoNome.toLowerCase()) {
        uf = key;
        break;
      }
    }

    return { cidade, estado: uf, estadoNome };
  } catch (error) {
    console.error("Erro no geocoding reverso:", error);
    return null;
  }
}

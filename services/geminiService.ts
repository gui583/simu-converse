
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Tweet, ProfileType, WorldState, Message, ScenarioCategory, TweetImpact, AppLanguage } from "../types";

const createAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to generate a random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

const getLanguageInstruction = (lang: AppLanguage) => {
    switch (lang) {
        case 'en-US': return "OUTPUT LANGUAGE: ENGLISH (US). All generated content (Bios, Tweets, Names, Trends) MUST be in English.";
        case 'es-ES': return "OUTPUT LANGUAGE: SPANISH. All generated content (Bios, Tweets, Names, Trends) MUST be in Spanish.";
        case 'pt-BR': 
        default: return "OUTPUT LANGUAGE: PORTUGUESE (BRAZIL). Todo o conteúdo gerado (Bio, Tweets, Nomes, Tendências) DEVE estar em Português do Brasil.";
    }
};

export const generateWorldData = async (
  scenario: string, 
  userParams: { name: string; handle: string; bio: string },
  category: ScenarioCategory = 'NORMAL',
  language: AppLanguage = 'pt-BR'
): Promise<{ profiles: UserProfile[]; trends: string[]; initialTweets: Tweet[]; visualStyle: string }> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  let categoryInstruction = "";
  if (category === 'NEWS') {
      categoryInstruction = "FOCO DO CONTEÚDO: NOTÍCIAS E REPORTAGENS. Os perfis devem ser majoritariamente de jornais, repórteres, canais de TV e testemunhas oculares. Os tweets devem ter tom de manchete, breaking news ou furo de reportagem.";
  } else if (category === 'RECIPES') {
      categoryInstruction = "FOCO DO CONTEÚDO: CULINÁRIA E RECEITAS. Os perfis devem ser de chefs, críticos gastronômicos, amantes de comida e restaurantes. Os tweets devem conter receitas, fotos de pratos (descritas), dicas de cozinha e opiniões sobre comida.";
  } else if (category === 'JOKES') {
      categoryInstruction = "FOCO DO CONTEÚDO: HUMOR E PIADAS. Os perfis devem ser de comediantes, páginas de memes, sátiras e pessoas engraçadas. Os tweets devem ser piadas, trocadilhos, situações cômicas ou absurdas.";
  } else {
      categoryInstruction = "FOCO DO CONTEÚDO: PADRÃO/VARIADO. Mistura equilibrada de fofoca, esporte, notícias e vida cotidiana. INCLUA PERFIS DE HUMOR (COMEDIANTES/MEMES).";
  }

  const systemInstruction = `Você é o motor de jogo 'SimuVerse'. Sua tarefa é criar um universo de mídia social simulado com base no cenário do usuário: "${scenario}".
  
  ${getLanguageInstruction(language)}
  ${categoryInstruction}
  
  Você deve gerar:
  1. Um 'visualStyle' (string em inglês) que defina o estilo visual das imagens de avatar (ex: "anime style", "cinematic realistic photography", "pixel art"). O estilo deve combinar com o cenário.
  2. Uma lista de perfis de NPC variados (adaptados ao FOCO acima).
  3. Tendências (hashtags).
  4. Tweets iniciais (adaptados ao FOCO acima).
  
  O usuário jogará como: ${userParams.name} (@${userParams.handle}), Bio: ${userParams.bio}.
  `;

  // Define schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      visualStyle: { type: Type.STRING, description: "Prompt string defining the visual style of images (e.g. 'anime style', 'realistic', 'cyberpunk')" },
      npcs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            handle: { type: Type.STRING },
            displayName: { type: Type.STRING },
            bio: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['NORMAL', 'GOSSIP', 'SPORTS', 'COOKING', 'OFFICIAL', 'HUMOR'] },
            isVerified: { type: Type.BOOLEAN },
          },
          required: ['handle', 'displayName', 'bio', 'type']
        }
      },
      trends: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      tweets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            authorHandle: { type: Type.STRING },
            content: { type: Type.STRING },
            likes: { type: Type.INTEGER },
            retweets: { type: Type.INTEGER }
          },
          required: ['authorHandle', 'content', 'likes', 'retweets']
        }
      }
    },
    required: ['visualStyle', 'npcs', 'trends', 'tweets']
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gere o estado inicial do mundo.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8 
      }
    });

    const data = JSON.parse(response.text || "{}");

    // Map to App types
    const profiles: UserProfile[] = data.npcs.map((npc: any) => ({
      id: generateId(),
      handle: npc.handle,
      displayName: npc.displayName,
      bio: npc.bio,
      avatarSeed: npc.handle, // We use this as seed for pollination
      type: npc.type as ProfileType,
      followers: Math.floor(Math.random() * 50000) + 100,
      following: Math.floor(Math.random() * 500) + 10,
      followingIds: [],
      isVerified: npc.isVerified || false,
      aura: Math.floor(Math.random() * 50) + 20,
      popularity: Math.floor(Math.random() * 40) + 10,
      creativity: Math.floor(Math.random() * 60) + 20
    }));

    // Add User Profile
    const userProfile: UserProfile = {
      id: "USER_ME",
      handle: userParams.handle,
      displayName: userParams.name,
      bio: userParams.bio,
      avatarSeed: "me",
      type: ProfileType.USER,
      followers: 42,
      following: 0,
      followingIds: [],
      isVerified: true,
      aura: 10,
      popularity: 5,
      creativity: 10
    };
    profiles.unshift(userProfile);

    const initialTweets: Tweet[] = data.tweets.map((t: any) => {
      const author = profiles.find(p => p.handle === t.authorHandle) || profiles[1]; 
      
      const tweet: Tweet = {
        id: generateId(),
        authorId: author.id,
        content: t.content,
        timestamp: new Date().toISOString(),
        likes: t.likes,
        retweets: t.retweets,
        replies: Math.floor(t.likes / 10)
      };

      return tweet;
    });

    return {
      profiles,
      trends: data.trends || ["#NewWorld"],
      initialTweets,
      visualStyle: data.visualStyle || "realistic photography"
    };

  } catch (error) {
    console.error("Error generating world:", error);
    throw error;
  }
};

export const analyzeTweetImpact = async (
  tweetContent: string,
  userProfile: UserProfile,
  world: WorldState
): Promise<TweetImpact> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const systemInstruction = `Cenário do Jogo: "${world.scenarioName}".
  Usuário: ${userProfile.displayName} (@${userProfile.handle}). Bio: "${userProfile.bio}".
  ${getLanguageInstruction(world.language)}
  
  O usuário acabou de postar: "${tweetContent}".
  
  Você deve calcular o impacto social deste tweet (Gamificação).
  Analise se o tweet é bom, engraçado, criativo ou "cringe", ofensivo, ruim para o cenário.
  
  Se for BOM: dê pontos positivos em seguidores, aura, popularidade, criatividade.
  Se for RUIM/CRINGE/OFENSIVO: dê pontos NEGATIVOS.
  
  Regras:
  - Aura: "Vibe" ou "Coolness".
  - Popularidade: Fama geral.
  - Criatividade: Originalidade do post.
  - Followers: Podem subir ou descer.
  
  Output esperado (JSON):
  - followersChange (int): ex: +120 ou -50
  - auraChange (int): ex: +5 ou -10
  - popularityChange (int): ex: +2 ou -5
  - creativityChange (int): ex: +10 ou 0
  - analysis (string): Uma frase curta (max 6 palavras) explicando o motivo. Ex: "Mandou muito bem!", "Ninguém entendeu a piada.", "Fãs odiaram isso."
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      followersChange: { type: Type.INTEGER },
      auraChange: { type: Type.INTEGER },
      popularityChange: { type: Type.INTEGER },
      creativityChange: { type: Type.INTEGER },
      analysis: { type: Type.STRING }
    },
    required: ['followersChange', 'auraChange', 'popularityChange', 'creativityChange', 'analysis']
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Analise o impacto do tweet.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      followersChange: data.followersChange || 0,
      auraChange: data.auraChange || 0,
      popularityChange: data.popularityChange || 0,
      creativityChange: data.creativityChange || 0,
      analysis: data.analysis || "Sem impacto."
    };

  } catch (e) {
    console.error("Error analyzing tweet impact:", e);
    // Fallback default
    return {
      followersChange: 1,
      auraChange: 0,
      popularityChange: 0,
      creativityChange: 0,
      analysis: "Postado."
    };
  }
};

export const generateTweetSuggestions = async (
  world: WorldState,
  userProfile: UserProfile
): Promise<string[]> => {
    const ai = createAI();
    const model = "gemini-2.5-flash";

    const systemInstruction = `Cenário: ${world.scenarioName}.
    Personagem do Usuário: ${userProfile.displayName} (Bio: ${userProfile.bio}).
    ${getLanguageInstruction(world.language)}
    
    Gere 3 sugestões de tweets CURTOS (max 140 chars) que o usuário poderia postar agora.
    As sugestões devem ser interessantes, contextuais ao cenário e ajudar a ganhar "Aura" ou "Popularidade".
    Varie os estilos (uma piada, uma opinião polêmica, uma observação casual).
    
    Retorne apenas um array JSON de strings.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: ['suggestions']
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: "Gere 3 ideias de tweets.",
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        const data = JSON.parse(response.text || "{}");
        return data.suggestions || [];
    } catch (e) {
        console.error("Error generating suggestions", e);
        return ["Olá mundo!", "Dia agitado hoje...", "Alguém viu isso?"];
    }
}

export const generateNewTweets = async (
  world: WorldState
): Promise<Tweet[]> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const npcSummaries = world.profiles
    .filter(p => p.type !== ProfileType.USER)
    .map(p => `${p.displayName} (@${p.handle}): ${p.bio}`)
    .slice(0, 15)
    .join("\n");
  
  const recentEvents = world.tweets.slice(0, 5).map(t => t.content).join(" | ");

  let categoryContext = "";
  if (world.category === 'NEWS') categoryContext = "Mantenha o tom de jornalismo, manchetes e notícias urgentes.";
  if (world.category === 'RECIPES') categoryContext = "Mantenha o foco em comida, receitas deliciosas e críticas de restaurantes.";
  if (world.category === 'JOKES') categoryContext = "Mantenha o foco em humor, piadas e situações engraçadas.";

  const systemInstruction = `Cenário: ${world.scenarioName}.
  ${getLanguageInstruction(world.language)}
  ${categoryContext}
  
  Personagens:
  ${npcSummaries}
  
  Eventos Recentes:
  ${recentEvents}
  
  Gere 3 novos tweets interessantes.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        authorHandle: { type: Type.STRING },
        content: { type: Type.STRING },
        likes: { type: Type.INTEGER }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gerar novos tweets.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((t: any) => {
      const author = world.profiles.find(p => p.handle === t.authorHandle) || world.profiles.find(p => p.type !== ProfileType.USER)!;
      const tweet: Tweet = {
        id: generateId(),
        authorId: author.id,
        content: t.content,
        timestamp: new Date().toISOString(),
        likes: t.likes,
        retweets: Math.floor(t.likes / 5),
        replies: Math.floor(t.likes / 20)
      };

      return tweet;
    });

  } catch (e) {
    console.error(e);
    return [];
  }
};

export const generateReplyOrReaction = async (
  world: WorldState,
  userAction: string 
): Promise<Tweet[]> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const npcSummaries = world.profiles
    .filter(p => p.type !== ProfileType.USER)
    .map(p => `${p.displayName} (@${p.handle}) [Type: ${p.type}]`)
    .join("\n");

  const systemInstruction = `Cenário: ${world.scenarioName}.
  ${getLanguageInstruction(world.language)}
  O Usuário (@${world.userProfile?.handle}) fez: "${userAction}".
  
  Gere reações (1-2 tweets).`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        authorHandle: { type: Type.STRING },
        content: { type: Type.STRING }
      }
    }
  };

  const response = await ai.models.generateContent({
      model,
      contents: "Gerar reações.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
  });

  const data = JSON.parse(response.text || "[]");
    
  return data.map((t: any) => {
    const author = world.profiles.find(p => p.handle === t.authorHandle) || world.profiles.find(p => p.type !== ProfileType.USER)!;
    const tweet: Tweet = {
      id: generateId(),
      authorId: author.id,
      content: t.content,
      timestamp: new Date().toISOString(),
      likes: Math.floor(Math.random() * 50),
      retweets: 0,
      replies: 0,
      replyToId: "USER_ACTION_REF" 
    };

    return tweet;
  });
}

export const generateTweetReplies = async (
  tweet: Tweet,
  author: UserProfile,
  world: WorldState
): Promise<{ replies: Tweet[]; newProfiles: UserProfile[] }> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  let replyCount = 2; 
  if (author.type === ProfileType.GOSSIP || author.type === ProfileType.OFFICIAL || author.followers > 10000) {
    replyCount = 6;
  }
  
  let categoryContext = "";
  if (world.category === 'JOKES') categoryContext = "Os comentários devem ser engraçados ou continuar a piada.";
  
  const systemInstruction = `Cenário: ${world.scenarioName}.
  ${getLanguageInstruction(world.language)}
  ${categoryContext}
  Post Original de ${author.displayName}: "${tweet.content}"
  
  Gere ${replyCount} comentários.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        isExistingNpc: { type: Type.BOOLEAN },
        handle: { type: Type.STRING },
        displayName: { type: Type.STRING },
        content: { type: Type.STRING },
        likes: { type: Type.INTEGER }
      },
      required: ['isExistingNpc', 'handle', 'content', 'likes']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gerar comentários.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    const newProfiles: UserProfile[] = [];
    const replies: Tweet[] = [];

    data.forEach((item: any) => {
      let replyAuthor = world.profiles.find(p => p.handle === item.handle);

      if (!replyAuthor && !item.isExistingNpc) {
        replyAuthor = {
          id: generateId(),
          handle: item.handle,
          displayName: item.displayName || item.handle,
          bio: "Habitante do universo",
          avatarSeed: item.handle,
          type: ProfileType.NORMAL,
          followers: Math.floor(Math.random() * 500),
          following: Math.floor(Math.random() * 200),
          followingIds: [],
          aura: Math.floor(Math.random() * 50),
          popularity: Math.floor(Math.random() * 10),
          creativity: Math.floor(Math.random() * 50)
        };
        newProfiles.push(replyAuthor);
      } else if (!replyAuthor) {
          replyAuthor = world.profiles[Math.floor(Math.random() * world.profiles.length)];
      }

      replies.push({
        id: generateId(),
        authorId: replyAuthor.id,
        content: item.content,
        timestamp: new Date().toISOString(),
        likes: item.likes,
        retweets: 0,
        replies: 0,
        replyToId: tweet.id
      });
    });

    return { replies, newProfiles };

  } catch (e) {
    console.error("Error generating replies:", e);
    return { replies: [], newProfiles: [] };
  }
};

export const generateTweetsForTopic = async (
  world: WorldState,
  topic: string
): Promise<Tweet[]> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const systemInstruction = `Cenário: ${world.scenarioName}.
  ${getLanguageInstruction(world.language)}
  Pesquisa: "${topic}".
  
  Gere 4 tweets relevantes sobre esse tópico no contexto do cenário.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        authorHandle: { type: Type.STRING },
        content: { type: Type.STRING },
        likes: { type: Type.INTEGER },
        retweets: { type: Type.INTEGER }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gerar tweets para a pesquisa.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "[]");

    return data.map((t: any) => {
      const author = world.profiles.find(p => p.handle === t.authorHandle) || world.profiles.filter(p => p.type !== ProfileType.USER)[Math.floor(Math.random() * (world.profiles.length - 1))];
      
      const tweet: Tweet = {
        id: generateId(),
        authorId: author.id,
        content: t.content,
        timestamp: new Date().toISOString(),
        likes: t.likes,
        retweets: t.retweets,
        replies: Math.floor(t.likes / 15)
      };

      return tweet;
    });

  } catch (e) {
    console.error("Error generating topic tweets:", e);
    return [];
  }
};

export const generateCharacter = async (
  characterName: string,
  scenario: string,
  language: AppLanguage = 'pt-BR'
): Promise<{ profile: UserProfile, introTweet: Tweet } | null> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const systemInstruction = `Cenário do Jogo: "${scenario}".
  ${getLanguageInstruction(language)}
  
  O usuário quer adicionar o personagem "${characterName}".
  
  1. Criar perfil.
  2. Gerar tweet de introdução.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      displayName: { type: Type.STRING },
      handle: { type: Type.STRING },
      bio: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['NORMAL', 'GOSSIP', 'SPORTS', 'COOKING', 'OFFICIAL', 'HUMOR'] },
      firstTweetContent: { type: Type.STRING }
    },
    required: ['displayName', 'handle', 'bio', 'type', 'firstTweetContent']
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Adicionar personagem: ${characterName}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "{}");
    const id = generateId();

    const profile: UserProfile = {
      id,
      handle: data.handle,
      displayName: data.displayName,
      bio: data.bio,
      avatarSeed: data.displayName,
      type: data.type as ProfileType,
      followers: Math.floor(Math.random() * 500000) + 1000,
      following: Math.floor(Math.random() * 100),
      followingIds: [],
      isVerified: true,
      aura: 50,
      popularity: 20,
      creativity: 50
    };

    const introTweet: Tweet = {
      id: generateId(),
      authorId: id,
      content: data.firstTweetContent,
      timestamp: new Date().toISOString(),
      likes: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 500),
      replies: 0
    };

    return { profile, introTweet };

  } catch (e) {
    console.error("Error generating character:", e);
    return null;
  }
};

export const generateDirectMessageReply = async (
    targetProfile: UserProfile,
    userProfile: UserProfile,
    history: Message[],
    scenario: string,
    language: AppLanguage = 'pt-BR'
): Promise<string> => {
    const ai = createAI();
    const model = "gemini-2.5-flash";
    
    // Format history
    const historyText = history.map(m => 
        `${m.senderId === 'USER_ME' ? userProfile.displayName : targetProfile.displayName}: ${m.content}`
    ).join("\n");

    const systemInstruction = `Cenário: ${scenario}.
    ${getLanguageInstruction(language)}
    Você está interpretando: ${targetProfile.displayName} (@${targetProfile.handle}).
    Bio: "${targetProfile.bio}".
    Tipo: ${targetProfile.type}.
    
    Você está em uma conversa privada (DM) com o usuário (${userProfile.displayName}).
    
    Histórico da conversa:
    ${historyText}
    
    Responda à última mensagem do usuário de forma natural e consistente com sua persona. Seja breve (estilo DM).
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: "Responda à mensagem.",
            config: {
                systemInstruction,
                responseMimeType: "text/plain", // Simple text for DM
            }
        });
        
        return response.text?.trim() || "👍";
    } catch (e) {
        console.error("Error generating DM reply:", e);
        return "...";
    }
};

export const generateRPGReactions = async (
  world: WorldState,
  title: string,
  description: string,
  participantIds: string[]
): Promise<Tweet[]> => {
  const ai = createAI();
  const model = "gemini-2.5-flash";

  const participants = world.profiles.filter(p => participantIds.includes(p.id));
  const participantsSummary = participants.map(p => `${p.displayName} (@${p.handle})`).join(", ");

  const systemInstruction = `Cenário: ${world.scenarioName}.
  ${getLanguageInstruction(world.language)}
  
  OCORREU UM EVENTO DE RPG CRIADO PELO USUÁRIO (NARRATIVA):
  Título: "${title}"
  Descrição: "${description}"
  
  Participantes Envolvidos: ${participantsSummary}
  
  Sua tarefa: Gerar uma onda de tweets reagindo a este evento.
  - Se o evento for bombástico, gere mais tweets (até 8). Se for calmo, menos (3-4).
  - Inclua tweets dos PERSONAGENS PARTICIPANTES falando sobre o que aconteceu (sob o ponto de vista deles).
  - Inclua tweets da mídia (fofoca, notícias) se fizer sentido.
  - Inclua tweets de aleatórios reagindo.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        authorHandle: { type: Type.STRING },
        content: { type: Type.STRING },
        likes: { type: Type.INTEGER },
        retweets: { type: Type.INTEGER }
      },
      required: ['authorHandle', 'content', 'likes']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Gerar reações do evento RPG.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "[]");

    return data.map((t: any) => {
      // Try to find author in world, prioritize participants
      let author = world.profiles.find(p => p.handle === t.authorHandle);
      
      // If AI hallucinated a handle or used a participant not explicitly passed but known in world
      if (!author) {
          author = world.profiles[Math.floor(Math.random() * (world.profiles.length - 1))];
      }

      const tweet: Tweet = {
        id: generateId(),
        authorId: author.id,
        content: t.content,
        timestamp: new Date().toISOString(),
        likes: t.likes,
        retweets: t.retweets || 0,
        replies: Math.floor(t.likes / 10)
      };

      return tweet;
    });

  } catch (e) {
    console.error("Error generating RPG tweets:", e);
    return [];
  }
};

/**
 * Vayu AI Service
 * Provides 100% frontend-only AI capabilities powered by the Vayu Neural Engine (Puter.js).
 */

declare const puter: any;

export interface ResearchResult {
  title: string;
  content: string;
  type: string;
  timestamp: number;
}

// Helper to ensure Puter.js is loaded
const ensurePuter = () => {
  if (typeof puter === 'undefined') {
    throw new Error("Vayu Neural Link (Puter.js) is not initialized. Please refresh the page.");
  }
};

export async function conductResearch(prompt: string, systemInstruction: string): Promise<string> {
  try {
    ensurePuter();
    // Vayu Neural Synthesis via Puter.js Interface
    const response = await puter.ai.chat(`${systemInstruction}\n\nUser Request: ${prompt}`);
    
    if (!response) {
      throw new Error("Empty response from Vayu Neural Engine.");
    }

    const content = typeof response === 'string' ? response : (response.message?.content || JSON.stringify(response));
    return content;
  } catch (error: any) {
    console.error("Vayu AI Research Error:", error);
    throw error;
  }
}

// Advanced parsing for structured data from AI responses
export function parseSimulationData(content: string) {
  // Simple heuristic to extract "complexity" or "color" from content
  const complexity = (content.match(/complex|advanced|intricate/gi) || []).length;
  const isMedical = /medical|biological|clinical/gi.test(content);
  const isMechanical = /mechanical|engine|machine/gi.test(content);
  
  return {
    complexity: Math.min(10, complexity + 1),
    theme: isMedical ? 'medical' : isMechanical ? 'mechanical' : 'general'
  };
}

export function parseGraphData(content: string) {
  // Extract keywords for nodes
  const keywords = content.match(/[A-Z][a-z]{3,}/g) || ["Vayu", "Neural", "Synthesis"];
  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 8);
  
  const nodes = uniqueKeywords.map((id, i) => ({ id, group: (i % 5) + 1 }));
  const links = [];
  for(let i=1; i<nodes.length; i++) {
    links.push({ source: nodes[0].id, target: nodes[i].id });
  }
  
  return { nodes, links };
}

export async function saveInvention(invention: ResearchResult): Promise<void> {
  try {
    ensurePuter();
    const existing = await puter.kv.get('vayu_inventions') || '[]';
    let inventions = [];
    try {
      inventions = JSON.parse(existing);
    } catch (e) {
      inventions = [];
    }
    inventions.push(invention);
    await puter.kv.set('vayu_inventions', JSON.stringify(inventions));
  } catch (e: any) {
    console.error("Failed to save invention:", e);
    throw new Error(`Cloud Save Failed: ${e.message}`);
  }
}

export async function getSavedInventions(): Promise<ResearchResult[]> {
  try {
    ensurePuter();
    const existing = await puter.kv.get('vayu_inventions') || '[]';
    try {
      return JSON.parse(existing);
    } catch (e) {
      return [];
    }
  } catch (e) {
    console.error("Failed to fetch inventions:", e);
    return [];
  }
}

export async function exportToVayuDrive(filename: string, content: string): Promise<void> {
  try {
    ensurePuter();
    // Save to Vayu's virtual file system (Puter.js FS)
    await puter.fs.write(filename, content);
  } catch (e: any) {
    console.error("Failed to export to Vayu Drive:", e);
    throw new Error(`Vayu Drive Export Failed: ${e.message}`);
  }
}

export const SYSTEM_INSTRUCTIONS = {
  DECONSTRUCTION: "You are an elite mechanical and biomedical engineer. Analyze the provided machine or technology with extreme precision. Break it down into functional components, identify material specifications, failure points, and cost inefficiencies. Include a 'Failure Mode and Effects Analysis' (FMEA) summary with risk priority numbers. Use advanced technical terminology and provide a structured analysis with markdown.",
  INNOVATION: "You are a visionary inventor with expertise in quantum mechanics and synthetic biology. Generate a groundbreaking novel concept for a machine or device. Combine disparate engineering disciplines, apply advanced biomimicry, and suggest non-obvious mechanisms. Focus on 'impossible' but theoretically grounded ideas. Include a 'Theoretical Feasibility Score' (1-10), potential societal impact, and a list of required scientific breakthroughs. Use markdown.",
  DESIGN: "You are a lead systems architect for advanced aerospace and medical systems. Generate a comprehensive architecture for a complex machine. Include mechanical sub-assemblies, a detailed Bill of Materials (BOM) with estimated tolerances, functional modules, power distribution systems, sensor arrays, and control logic. Provide a 'System Integration Map' in text format and use markdown.",
  PRINCIPLE_EXPLORER: "You are a theoretical physicist and molecular biologist. Connect deep principles from quantum field theory, thermodynamics, and cellular biology to suggest novel mechanisms for future technology. Focus on the underlying scientific 'why' and 'how'. Include relevant equations, theoretical constants, and potential experimental setups for verification. Use markdown.",
  PATENT_DISRUPTION: "You are a senior patent attorney and strategic market analyst. Analyze current technology landscapes and patent clusters to identify 'disruption gaps'. Suggest specific invention vectors that could bypass existing IP or solve multi-decade industry bottlenecks. Include a 'Patentability Strategy' and a 'Freedom to Operate' risk assessment. Use markdown.",
  CROSS_INDUSTRY: "You are a multidisciplinary innovation strategist. Take highly specialized concepts from one industry (e.g., high-energy physics, deep-sea exploration) and apply them to solve critical problems in another (e.g., neuro-surgery, renewable energy). Generate a detailed proposal including 'Technology Transfer' challenges, adaptation requirements, and expected performance gains. Use markdown.",
  MEDICAL_INVENTOR: "You are a world-class biomedical engineer and clinical researcher. Invent a new medical device that addresses a specific, unmet clinical need. Include clinical problem statement, solution mechanism, biocompatibility considerations, component breakdown, and a detailed patent strategy. Add sections on 'Regulatory Pathway' (FDA Class III/CE Mark) and a 'Clinical Trial Phase I/II' design overview. Use markdown.",
};

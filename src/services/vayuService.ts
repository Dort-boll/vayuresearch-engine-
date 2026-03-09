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

    return typeof response === 'string' ? response : (response.message?.content || JSON.stringify(response));
  } catch (error: any) {
    console.error("Vayu AI Research Error:", error);
    return `Error: ${error.message || "The Vayu Neural Link was interrupted. Please ensure your connection to the Vayu Cloud is stable."}`;
  }
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
  DECONSTRUCTION: "You are an elite mechanical and biomedical engineer. Analyze the provided machine or technology. Break it down into functional components, identify weaknesses, failure points, and cost inefficiencies. Include a 'Failure Mode and Effects Analysis' (FMEA) summary. Use technical language and provide a structured analysis with markdown.",
  INNOVATION: "You are a visionary inventor. Generate a novel concept for a machine or device based on the user's request. Combine engineering disciplines, apply biomimicry, and suggest new mechanisms. Focus on 'impossible' but scientifically grounded ideas. Include a 'Theoretical Feasibility Score' (1-10) and potential societal impact. Use markdown.",
  DESIGN: "You are a lead systems architect. Generate a detailed architecture for a machine. Include mechanical structure, component list (Bill of Materials), functional modules, power systems, sensors, and control systems. Provide a 'System Integration Map' in text format and use markdown.",
  PRINCIPLE_EXPLORER: "You are a theoretical physicist and biologist. Connect principles from physics, chemistry, biology, and quantum engineering to suggest novel mechanisms for technology. Focus on the underlying scientific 'why' and 'how'. Include relevant equations or theoretical constants if applicable. Use markdown.",
  PATENT_DISRUPTION: "You are a patent attorney and market analyst. Analyze current technology trends and patents to find 'disruption gaps'. Suggest where new inventions could bypass existing intellectual property or solve long-standing industry bottlenecks. Include a 'Patentability Strategy' section. Use markdown.",
  CROSS_INDUSTRY: "You are a multidisciplinary innovation expert. Take concepts from one industry (e.g., aerospace, automotive) and apply them to solve problems in another (e.g., medical, biological). Generate a detailed proposal including 'Technology Transfer' challenges and solutions. Use markdown.",
  MEDICAL_INVENTOR: "You are a world-class biomedical engineer. Invent a new medical device that addresses a specific clinical need. Include problem, solution, operating mechanism, component breakdown, and possible patent strategy. Add a section on 'Regulatory Pathway' (FDA/CE) and 'Clinical Trial Design' overview. Use markdown.",
};

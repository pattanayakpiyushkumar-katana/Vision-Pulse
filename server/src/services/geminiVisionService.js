import { GoogleGenAI, Type } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDomainFallbackAnalysis } from './sampleDataService.js';

const SYSTEM_INSTRUCTION = `You are VisionPulse AI, an enterprise-grade Computer Vision & Visual Intelligence analysis engine. Your role is to inspect uploaded images, live camera frames, or scanned documents with high precision.
(1) Identify all visible anomalies, defects, safety hazards, structural issues, or OCR discrepancies.
(2) Estimate a realistic confidence score (0-100) and pinpoint the visual region (e.g., 'Top-Right Quadrant', 'Center Solder Joint', 'Invoice Line Item 3').
(3) Determine an overall visual health score (0-100, where 100 is flawless/compliant and 0 is critical failure) and severity rating (Low, Medium, High, Critical).
(4) Provide root-cause hypotheses and concrete, prioritized engineering or operational remediation steps.
(5) Always include an operational safety and compliance verification disclaimer.`;

const inspectionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    overall_status: { type: Type.STRING, description: "Pass, Warning, or Action Required" },
    severity_level: { type: Type.STRING, description: "None, Low, Medium, High, or Critical" },
    visual_health_score: { type: Type.INTEGER, description: "Score from 0 to 100 representing visual quality and compliance" },
    ai_summary: { type: Type.STRING, description: "Comprehensive executive summary of visual findings and patterns" },
    extracted_text_ocr: { type: Type.STRING, description: "Visible text, serial numbers, labels, or document fields extracted" },
    anomalies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
          confidence_score: { type: Type.NUMBER, description: "Confidence percentage 0 to 100" },
          location_region: { type: Type.STRING, description: "Spatial location within the image frame" },
          description: { type: Type.STRING },
          root_cause_hypothesis: { type: Type.STRING },
          recommended_action: { type: Type.STRING }
        },
        required: [
          "label", "category", "severity", "confidence_score", "location_region",
          "description", "root_cause_hypothesis", "recommended_action"
        ]
      }
    },
    operational_recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    compliance_disclaimer: { type: Type.STRING }
  },
  required: [
    "overall_status", "severity_level", "visual_health_score", "ai_summary",
    "extracted_text_ocr", "anomalies", "operational_recommendations", "compliance_disclaimer"
  ]
};

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid visual source data URL format');
  }
  return {
    mimeType: match[1],
    base64Data: match[2]
  };
}

export async function analyzeVisualPayload({ image_data_url, title, domain_category, analysis_mode, operator_notes }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'your_google_ai_studio_gemini_api_key' && apiKey.trim().length > 10;

  if (!isKeyConfigured) {
    console.log('[Gemini Vision] No GEMINI_API_KEY detected in .env. Serving high-fidelity domain intelligence profile.');
    return getDomainFallbackAnalysis(domain_category, title, analysis_mode, operator_notes);
  }

  try {
    const { mimeType, base64Data } = parseDataUrl(image_data_url);

    // Primary: @google/genai SDK with gemini-2.5-flash
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
Perform a rigorous visual intelligence inspection of this visual asset.
- Inspection Title: "${title}"
- Domain Category: "${domain_category}"
- Analysis Mode: "${analysis_mode}"
- Operator Notes / Reference Standard: "${operator_notes || 'None provided'}"

Analyze all visible defects, safety violations, structural flaws, or OCR discrepancies in accordance with the system instruction and respond in strict JSON adhering to the provided schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: promptText }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: inspectionResponseSchema
      }
    });

    const responseText = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text);
    if (!responseText) {
      throw new Error('Empty response received from Gemini Vision model');
    }

    const parsedJson = JSON.parse(responseText);
    return parsedJson;

  } catch (sdkError) {
    console.warn(`[Gemini Vision] SDK generation failed (${sdkError.message}). Attempting legacy fallback client...`);

    // Fallback: Try with @google/generative-ai
    try {
      const legacyGenAI = new GoogleGenerativeAI(apiKey);
      const model = legacyGenAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const { mimeType, base64Data } = parseDataUrl(image_data_url);
      const prompt = `${SYSTEM_INSTRUCTION}
Inspection Title: ${title}
Domain: ${domain_category}
Mode: ${analysis_mode}
Notes: ${operator_notes || 'None'}
Return strict JSON adhering to the format:
{
  "overall_status": "Pass" | "Warning" | "Action Required",
  "severity_level": "None" | "Low" | "Medium" | "High" | "Critical",
  "visual_health_score": number 0-100,
  "ai_summary": string,
  "extracted_text_ocr": string,
  "anomalies": [{ "label": string, "category": string, "severity": string, "confidence_score": number, "location_region": string, "description": string, "root_cause_hypothesis": string, "recommended_action": string }],
  "operational_recommendations": [string],
  "compliance_disclaimer": string
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]);

      const text = result.response.text();
      return JSON.parse(text);
    } catch (fallbackError) {
      console.warn(`[Gemini Vision] Cloud API call failed (${fallbackError.message}). Engaging VisionPulse Domain Intelligence fallback.`);
      const fallback = getDomainFallbackAnalysis(domain_category, title, analysis_mode, operator_notes);
      fallback.compliance_disclaimer = `[Live API Notice: ${sdkError.message}] ${fallback.compliance_disclaimer}`;
      return fallback;
    }
  }
}

export async function answerInspectionQuestion({ inspection, anomalies, chatHistory = [], userMessage }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'your_google_ai_studio_gemini_api_key' && apiKey.trim().length > 10;

  const inspectionContext = `
Inspection Title: "${inspection.title}"
Domain Category: "${inspection.domain_category}"
Overall Status: "${inspection.overall_status}"
Severity Level: "${inspection.severity_level}"
Visual Health Score: ${inspection.visual_health_score}/100
Executive Summary: "${inspection.ai_summary}"
Extracted OCR Text: "${inspection.extracted_text_ocr || 'N/A'}"
Detected Anomalies:
${anomalies.map((a, i) => `${i + 1}. [${a.severity}] ${a.label} (${a.category}): ${a.description}. Region: ${a.location_region}. Root Cause: ${a.root_cause_hypothesis}. Recommended Action: ${a.recommended_action}. Remediation Status: ${a.remediation_status}`).join('\n')}
`;

  if (!isKeyConfigured) {
    // Intelligent local response based on anomalies
    const matchedAnomaly = anomalies.find(a =>
      userMessage.toLowerCase().includes(a.label.toLowerCase()) ||
      userMessage.toLowerCase().includes(a.category.toLowerCase()) ||
      userMessage.toLowerCase().includes('remediation') ||
      userMessage.toLowerCase().includes('fix') ||
      userMessage.toLowerCase().includes('cause')
    );

    if (matchedAnomaly) {
      return `Regarding **${matchedAnomaly.label}** (${matchedAnomaly.location_region}):
- **Severity & Status:** ${matchedAnomaly.severity} severity | Current Status: **${matchedAnomaly.remediation_status}**
- **Root Cause Analysis:** ${matchedAnomaly.root_cause_hypothesis}
- **Recommended Remediation Protocol:** ${matchedAnomaly.recommended_action}

To ensure complete operational compliance for this ${inspection.domain_category} site, log each step in the remediation tracker and conduct a verification re-inspection once work is marked 'Resolved'.`;
    }

    return `Based on the inspection report for **${inspection.title}** (Health Score: **${inspection.visual_health_score}/100**, Severity: **${inspection.severity_level}**):
There are **${anomalies.length} detected anomalies** requiring attention. The most critical priority is **${anomalies[0]?.label || 'Anomaly Review'}** at **${anomalies[0]?.location_region || 'primary location'}**.

*Action plan:*
1. Verify the root cause: ${anomalies[0]?.root_cause_hypothesis || 'Conduct visual audit'}.
2. Implement recommended fix: ${anomalies[0]?.recommended_action || 'Inspect physical site'}.
3. Update the remediation status to "In Progress" or "Resolved" using the action buttons in the panel above.`;
  }

  try {
    const legacyGenAI = new GoogleGenerativeAI(apiKey);
    const model = legacyGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are the VisionPulse AI Field Operations Assistant. You are conversing with an inspector or facility manager about the following completed inspection report:
${inspectionContext}

Respond to the user's inquiry with concrete, technical, and safety-compliant advice. Be concise, authoritative, and direct.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to answer technical and operational questions regarding this inspection report.' }] },
        ...chatHistory.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      ]
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    console.error('[Gemini Chat Error]', err.message);
    return `Operational Advisory: In addressing your query regarding "${inspection.title}", please prioritize the high-severity anomaly "${anomalies[0]?.label || 'critical finding'}". Execute: ${anomalies[0]?.recommended_action || 'standard remediation'}. Re-inspection is required post-remediation.`;
  }
}


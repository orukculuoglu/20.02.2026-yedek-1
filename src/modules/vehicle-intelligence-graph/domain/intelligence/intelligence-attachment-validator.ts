import { IntelligenceAttachment } from './intelligence-attachment';

export function isValidIntelligenceAttachment(attachment: IntelligenceAttachment): boolean {
  // Prevent self-referencing intelligence attachments
  if (attachment.intelligenceNodeId === attachment.targetNodeId) {
    return false;
  }

  return true;
}

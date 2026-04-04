import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TERMS_CONTENT = `Terms & Conditions

Last updated: January 2026

1. Acceptance of Terms
By accessing and using NeuroAI, you accept and agree to be bound by these Terms and Conditions.

2. Use of Service
NeuroAI is a personal productivity tool designed to help you capture, organize, and query your thoughts using AI. You agree to use the service only for lawful purposes.

3. Your Content
You retain full ownership of all thoughts and content you store in NeuroAI. We do not claim any rights over your content.

4. AI Features
NeuroAI uses AI to summarize and answer questions based solely on your stored thoughts. AI responses are for informational purposes only and should not be relied upon as professional advice.

5. Data Storage
Your thoughts are stored securely via Firebase. We do not sell or share your data with third parties.

6. Limitation of Liability
NeuroAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.

7. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the modified terms.`;

const PRIVACY_CONTENT = `Privacy Policy

Last updated: January 2026

1. Information We Collect
We collect the thoughts and notes you enter into NeuroAI, along with basic usage data to improve the service.

2. How We Use Your Information
Your thoughts are used solely to provide the AI summarization and question-answering features. They are never used for advertising or sold to third parties.

3. Data Storage
Your content is stored in Firebase Firestore, secured by Google's infrastructure. We implement reasonable security measures to protect your data.

4. AI Processing
When you use AI features, your thoughts are temporarily sent to OpenAI's API for processing. OpenAI's privacy policy governs that processing.

5. Cookies & Local Storage
We use localStorage to save your theme preference (light/dark mode). No tracking cookies are used.

6. Your Rights
You may delete your thoughts at any time from within the app. To request full data deletion, contact us.

7. Contact
For privacy-related questions, please reach out through the app.`;

function LegalModal({ title, content, open, onClose }: {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-background border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pt-2">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-border mt-24 py-8 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="order-2 sm:order-1">© 2026 NeuroAI. All rights reserved.</span>
            <div className="order-1 sm:order-2 flex items-center gap-4">
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline"
                data-testid="button-terms"
              >
                Terms & Conditions
              </button>
              <span className="text-border">·</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline"
                data-testid="button-privacy"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal
        title="Terms & Conditions"
        content={TERMS_CONTENT}
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
      <LegalModal
        title="Privacy Policy"
        content={PRIVACY_CONTENT}
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </>
  );
}

"use client";

import { Brain, MessageSquare, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/lib/validations/patient";

interface AIInsightsTabProps {
  patientId: string;
  patient: Patient;
}

export function AIInsightsTab({ patientId, patient }: AIInsightsTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-lg text-foreground mb-2">
          AI-Powered Clinical Decision Support
        </p>
        <p>
          This section provides AI-generated insights, trend analysis, and
          clinical notes for physician review. These features are currently in
          development.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Trends & Predictions */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Patient Trends & Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  AI trend analysis placeholder
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Future features: Predictive analytics for patient outcomes,
                  vitals trend detection, early warning scores, ECMO weaning
                  predictions
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Planned Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Survival probability estimation</li>
                <li>Optimal ECMO parameter recommendations</li>
                <li>Complication risk assessment</li>
                <li>Weaning readiness indicators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Clinical AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  AI chatbot interface placeholder
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Future features: Natural language queries about patient data,
                  evidence-based clinical recommendations, protocol guidance
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Ask questions about patient vitals, trends, or ECMO management... (Coming soon)"
                rows={3}
                disabled
                className="resize-none"
              />
              <Button disabled className="w-full">
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Notes */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            AI-Assisted Clinical Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Automated Clinical Summaries
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI-generated daily summaries of patient progress, vitals
                    trends, and significant events
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Smart Documentation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Voice-to-text note entry with automatic structuring and
                    medical terminology recognition
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Clinical Decision Support
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Evidence-based recommendations integrated into clinical
                    workflow
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Physician Notes</label>
            <Textarea
              placeholder="Clinical notes for this patient... (Manual entry available)"
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Note</Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Note:</span> AI-assisted features
              are placeholders for future development. Manual note entry is
              currently available for physician documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

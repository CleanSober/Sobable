import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Phone, MessageCircle, Globe, ChevronDown, ChevronUp, ExternalLink, Shield, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Resource {
  name: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
  available: string;
  icon: React.ElementType;
  color: string;
}

const crisisResources: Resource[] = [
  {
    name: "SAMHSA National Helpline",
    description: "Free, confidential, 24/7, 365-day-a-year treatment referral and information service for individuals and families facing mental and/or substance use disorders.",
    phone: "1-800-662-4357",
    website: "https://www.samhsa.gov/find-help/national-helpline",
    available: "24/7",
    icon: Phone,
    color: "text-red-400",
  },
  {
    name: "Crisis Text Line",
    description: "Free, 24/7 crisis support via text message. Trained crisis counselors available to help.",
    text: "HOME to 741741",
    website: "https://www.crisistextline.org",
    available: "24/7",
    icon: MessageCircle,
    color: "text-blue-400",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "Provides 24/7, free and confidential support for people in distress, prevention and crisis resources.",
    phone: "988",
    text: "988",
    website: "https://988lifeline.org",
    available: "24/7",
    icon: Heart,
    color: "text-pink-400",
  },
  {
    name: "AA Hotline",
    description: "Alcoholics Anonymous 24-hour helpline for support and meeting information.",
    phone: "1-800-839-1686",
    website: "https://www.aa.org",
    available: "24/7",
    icon: Users,
    color: "text-emerald-400",
  },
  {
    name: "NA Helpline",
    description: "Narcotics Anonymous helpline for support and recovery resources.",
    phone: "1-818-773-9999",
    website: "https://www.na.org",
    available: "24/7",
    icon: Shield,
    color: "text-violet-400",
  },
];

const selfHelpResources = [
  {
    title: "Grounding Exercises",
    steps: [
      "5-4-3-2-1: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste",
      "Hold ice cubes to bring yourself back to the present moment",
      "Do 10 jumping jacks or run in place",
      "Splash cold water on your face",
    ],
  },
  {
    title: "Urge Surfing",
    steps: [
      "Notice the urge without acting on it",
      "Accept that cravings are temporary—they peak and pass",
      "Breathe deeply and ride the wave",
      "Remind yourself: 'This will pass in 15-30 minutes'",
    ],
  },
  {
    title: "H.A.L.T. Check",
    steps: [
      "Hungry? Eat something nourishing",
      "Angry? Express it safely or journal",
      "Lonely? Reach out to someone",
      "Tired? Rest or take a nap if possible",
    ],
  },
];

export const CrisisResources = () => {
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [showSelfHelp, setShowSelfHelp] = useState(false);

  return (
    <div className="space-y-4">
      {/* Emergency Resources */}
      <Card className="gradient-card border-border/50 border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-red-400" />
            Crisis Resources
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            If you're in crisis, help is available 24/7
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {crisisResources.map((resource) => (
            <Collapsible
              key={resource.name}
              open={expandedResource === resource.name}
              onOpenChange={(open) => setExpandedResource(open ? resource.name : null)}
            >
              <CollapsibleTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/70 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/50">
                        <resource.icon className={`w-5 h-5 ${resource.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.available}</p>
                      </div>
                    </div>
                    {expandedResource === resource.name ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </motion.button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${resource.phone}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call {resource.phone}
                        </a>
                      </Button>
                    )}
                    {resource.text && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`sms:${resource.text.includes("to") ? resource.text.split(" to ")[1] : resource.text}`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Text {resource.text}
                        </a>
                      </Button>
                    )}
                    {resource.website && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={resource.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Self-Help Techniques */}
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Self-Help Techniques
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick strategies when you're struggling
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selfHelpResources.map((technique, index) => (
            <motion.div
              key={technique.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-secondary/50 border border-border/30"
            >
              <h4 className="font-medium text-foreground mb-3">{technique.title}</h4>
              <ul className="space-y-2">
                {technique.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

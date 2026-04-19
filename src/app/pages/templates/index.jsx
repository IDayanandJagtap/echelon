"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Copy, Trash2, Sparkles, CheckCircle2, LayoutTemplate, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Loading from "@/app/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import {
  activateTemplate,
  cloneTemplate,
  createTemplate,
  createTemplateRule,
  deleteTemplate,
  deleteTemplateRule,
  fetchTemplateRules,
  fetchTemplates,
  updateTemplateRule,
} from "@/app/pages/templates/services/templates.client";

const defaultTemplateForm = {
  name: "",
  description: "",
};

const defaultRuleForm = {
  title: "",
  description: "",
  starLevel: 1,
};

function getTemplateTypeLabel(type) {
  if (type === "customized") {
    return "Customized";
  }

  if (type === "predefined") {
    return "Predefined";
  }

  return type;
}

function RuleRow({ rule, canEdit, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: rule.title,
    description: rule.description || "",
    starLevel: rule.star_level,
  });

  useEffect(() => {
    setForm({
      title: rule.title,
      description: rule.description || "",
      starLevel: rule.star_level,
    });
  }, [rule]);

  return (
    <div className="rounded-lg border border-slate-700 bg-[#1c1c1c] p-3">
      {!isEditing ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-100">{rule.title}</p>
            {rule.description ? <p className="text-xs text-slate-400">{rule.description}</p> : null}
            <Badge className="bg-amber-500/15 text-amber-300 border-none">Star {rule.star_level}</Badge>
          </div>
          {canEdit ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-8 px-3" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="ghost" className="h-8 px-3 text-red-300" onClick={() => onDelete(rule.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="bg-[#111] border-slate-700"
          />
          <Textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="bg-[#111] border-slate-700"
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-300">Star</Label>
            <select
              value={form.starLevel}
              onChange={(event) => setForm((prev) => ({ ...prev, starLevel: Number(event.target.value) }))}
              className="bg-[#111] border border-slate-700 rounded px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" className="h-8 px-3" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              className="h-8 px-3 bg-sky-700 hover:bg-sky-600"
              onClick={async () => {
                await onSave(rule.id, {
                  title: form.title,
                  description: form.description,
                  starLevel: Number(form.starLevel),
                });
                setIsEditing(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [rules, setRules] = useState([]);
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm);
  const [ruleForm, setRuleForm] = useState(defaultRuleForm);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const predefinedCount = useMemo(
    () => templates.filter((template) => template.type === "predefined").length,
    [templates]
  );
  const customizedCount = useMemo(
    () => templates.filter((template) => template.type === "customized").length,
    [templates]
  );
  const activeTemplate = useMemo(
    () => templates.find((template) => template.type === "customized" && template.is_active) || null,
    [templates]
  );
  const hasAllStarLevels = useMemo(() => {
    const uniqueStars = new Set(
      rules
        .filter((rule) => rule.is_active !== false)
        .map((rule) => Number(rule.star_level))
        .filter((starLevel) => Number.isFinite(starLevel) && starLevel >= 1 && starLevel <= 5)
    );

    return uniqueStars.size >= 5;
  }, [rules]);

  const isCustomizedTemplate = selectedTemplate?.type === "customized";

  const loadTemplates = async () => {
    const result = await fetchTemplates();
    setTemplates(result);

    if (!result.length) {
      setSelectedTemplateId("");
      return;
    }

    setSelectedTemplateId((previous) => {
      if (previous && result.some((template) => template.id === previous)) {
        return previous;
      }

      const activeTemplate = result.find((template) => template.type === "customized" && template.is_active);
      return activeTemplate?.id || result[0].id;
    });
  };

  const loadRules = async (templateId) => {
    if (!templateId) {
      setRules([]);
      return;
    }

    const result = await fetchTemplateRules(templateId);
    setRules(result);
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await loadTemplates();
      } catch (error) {
        toast({
          title: "Could not load templates",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await loadRules(selectedTemplateId);
      } catch (error) {
        toast({
          title: "Could not load rules",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedTemplateId]);

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast({ title: "Template name is required", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      await createTemplate({
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
      });
      setTemplateForm(defaultTemplateForm);
      await loadTemplates();
      toast({ title: "Template created" });
    } catch (error) {
      toast({ title: "Could not create template", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneTemplate = async () => {
    if (!selectedTemplateId) {
      return;
    }

    try {
      setIsLoading(true);
      await cloneTemplate(selectedTemplateId);
      await loadTemplates();
      toast({ title: "Template cloned to your library" });
    } catch (error) {
      toast({ title: "Could not clone template", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateTemplate = async () => {
    if (!selectedTemplateId || !isCustomizedTemplate) {
      return;
    }

    try {
      setIsLoading(true);
      await activateTemplate(selectedTemplateId);
      await loadTemplates();
      toast({ title: "Template activated" });
    } catch (error) {
      toast({ title: "Could not activate template", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId || !isCustomizedTemplate) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteTemplate(selectedTemplateId);
      await loadTemplates();
      toast({ title: "Template deleted" });
    } catch (error) {
      toast({ title: "Could not delete template", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!selectedTemplateId || !isCustomizedTemplate) {
      return;
    }

    if (!ruleForm.title.trim()) {
      toast({ title: "Rule title is required", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      await createTemplateRule({
        templateId: selectedTemplateId,
        title: ruleForm.title.trim(),
        description: ruleForm.description.trim(),
        starLevel: Number(ruleForm.starLevel),
      });
      setRuleForm(defaultRuleForm);
      await loadRules(selectedTemplateId);
      toast({ title: "Added a new rule." });
    } catch (error) {
      toast({ title: "Could not create rule", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRule = async (ruleId, payload) => {
    try {
      setIsLoading(true);
      await updateTemplateRule({ ruleId, ...payload });
      await loadRules(selectedTemplateId);
      toast({ title: "Rule updated" });
    } catch (error) {
      toast({ title: "Could not update rule", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      setIsLoading(true);
      await deleteTemplateRule(ruleId);
      await loadRules(selectedTemplateId);
      toast({ title: "Rule deleted" });
    } catch (error) {
      toast({ title: "Could not delete rule", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 relative overflow-auto space-y-4">
      {isLoading ? <Loading overlay /> : null}

      <section className="relative overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-sky-950 via-[#111827] to-emerald-950 p-5 lg:p-6">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
              <LayoutTemplate className="h-3.5 w-3.5" />
              Template Playbook
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-100">Build a repeatable day with templates</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              A template is your reusable daily structure. Each rule belongs to a star level, and when all rules in a star are
              completed for the day, you earn that star. Use predefined templates for a quick start, then customize one to match
              your routine and activate it for task generation.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-slate-200">1. Pick or clone</span>
              <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-slate-200">2. Add star rules</span>
              <span className="rounded-full border border-slate-600 bg-slate-800/70 px-3 py-1 text-slate-200">3. Activate and generate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-600/70 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Predefined</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">{predefinedCount}</p>
            </div>
            <div className="rounded-lg border border-slate-600/70 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Customized</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">{customizedCount}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-slate-600/70 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Active Template</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Rocket className="h-4 w-4" />
                {activeTemplate?.name || "None active yet"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-xl border border-slate-700 bg-[#171717] p-4 space-y-4 shadow-[0_20px_35px_-25px_rgba(14,116,144,0.65)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Templates Library</h2>
            <p className="text-xs text-slate-400">Create your customized templates or clone predefined playbooks.</p>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-700/80 bg-[#121212] p-3">
            <Label className="text-xs text-slate-300">New Template</Label>
            <Input
              value={templateForm.name}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Template name"
              className="bg-[#111] border-slate-700"
            />
            <Textarea
              value={templateForm.description}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
              className="bg-[#111] border-slate-700"
            />
            <p className="text-[11px] text-slate-400">Tip: include focus areas like Health, Work, and Learning in your name.</p>
            <Button className="w-full bg-sky-700 hover:bg-sky-600" onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-1" />
              Create Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-300">Available Templates</Label>
            <div className="max-h-[360px] overflow-auto space-y-2">
              {templates.map((template) => {
                const isSelected = template.id === selectedTemplateId;

                return (
                  <button
                    type="button"
                    key={template.id}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-slate-700 bg-[#111] hover:border-slate-500 hover:-translate-y-[1px]"
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100">{template.name}</p>
                      <div className="flex items-center gap-1">
                        <Badge className="border-none bg-slate-700 text-slate-200">{getTemplateTypeLabel(template.type)}</Badge>
                        {template.is_active ? (
                          <Badge className="border-none bg-emerald-500/20 text-emerald-300">Active</Badge>
                        ) : null}
                      </div>
                    </div>
                    {template.description ? <p className="text-xs text-slate-400 mt-1">{template.description}</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-[#171717] p-4 space-y-4 shadow-[0_20px_35px_-25px_rgba(16,185,129,0.55)]">
          {!selectedTemplate ? (
            <div className="rounded-lg border border-dashed border-slate-700 bg-[#121212] p-6 text-sm text-slate-400">
              Select a template to manage its star rules and activation.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-700 bg-[#121212] p-3 text-xs text-slate-300">
                <p className="flex items-center gap-2 text-slate-200 font-medium">
                  <Star className="h-4 w-4 text-amber-300" />
                  How stars work for this template
                </p>
                <p className="mt-1 leading-5 text-slate-400">
                  Rules are grouped by star levels (1 to 5). Completing all tasks mapped to a star level earns that star for the day.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                <div>
                  <p className="text-sm text-slate-400">Selected template</p>
                  <h2 className="text-xl font-semibold text-slate-100">{selectedTemplate.name}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedTemplate.type === "predefined" ? (
                    <Button className="bg-violet-700 hover:bg-violet-600" onClick={handleCloneTemplate}>
                      <Copy className="h-4 w-4 mr-1" />
                      Clone to My Templates
                    </Button>
                  ) : null}

                  {isCustomizedTemplate ? (
                    <>
                      {!selectedTemplate?.is_active ? (
                        <Button className="bg-emerald-700 hover:bg-emerald-600" onClick={handleActivateTemplate}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Set Active
                        </Button>
                      ) : null}
                      <Button variant="ghost" className="text-red-300" onClick={handleDeleteTemplate}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {isCustomizedTemplate && !hasAllStarLevels ? (
                <div className="rounded-lg border border-slate-700 bg-[#111] p-3 space-y-2">
                  <p className="text-sm text-slate-200">Add Rule</p>
                  <Input
                    value={ruleForm.title}
                    onChange={(event) => setRuleForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Rule title"
                    className="bg-[#090909] border-slate-700"
                  />
                  <Textarea
                    value={ruleForm.description}
                    onChange={(event) => setRuleForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Description"
                    className="bg-[#090909] border-slate-700"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-300">Star</Label>
                    <select
                      value={ruleForm.starLevel}
                      onChange={(event) => setRuleForm((prev) => ({ ...prev, starLevel: Number(event.target.value) }))}
                      className="bg-[#090909] border border-slate-700 rounded px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>
                          {star}
                        </option>
                      ))}
                    </select>
                    <Button className="ml-auto bg-sky-700 hover:bg-sky-600" onClick={handleCreateRule}>
                      <Sparkles className="h-4 w-4 mr-1" />
                      Add Rule
                    </Button>
                  </div>
                </div>
              ) : isCustomizedTemplate ? (
                <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/10 p-3 text-xs text-emerald-300">
                  All 5 star levels are configured for this template. Add Rule is disabled.
                </div>
              ) : (
                <p className="text-xs text-slate-400">Clone this predefined template to customize rules.</p>
              )}

              <div className="space-y-3">
                {rules.length ? (
                  rules.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      canEdit={isCustomizedTemplate}
                      onSave={handleUpdateRule}
                      onDelete={handleDeleteRule}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                    No rules yet.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

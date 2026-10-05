// src/pages/SmartTools.tsx
// 🤖 Smart Tools IA - Version Publique avec Sélecteur de Pays
// Accessible sans compte (endpoint public limité) ; logique partagée avec le
// widget de la page d'accueil (useSavingsSimulator).

import { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Brain, Sparkles, CheckCircle2, Loader2, AlertTriangle, Globe, MapPin, PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LOCATION_CONFIGS,
  MARKET_CATEGORIES,
  MAX_DESCRIPTION_LENGTH,
  formatMoney,
  loadingMessage,
  monthlySaving,
  useSavingsSimulator,
} from '@/hooks/useSavingsSimulator';

export default function SmartTools() {
  const sim = useSavingsSimulator();
  const { config } = sim;
  const resultsRef = useRef<HTMLDivElement>(null);

  // On small screens the results land below the fold: bring them into view.
  useEffect(() => {
    if (sim.status === 'loading') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [sim.status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Brain className="h-5 w-5" aria-hidden="true" />
            <span className="font-semibold text-sm">Powered by Claude AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 px-2">
            Simulateur d'Économies IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 px-4">
            Testez la puissance de notre algorithme sur vos factures actuelles.
            Analyse de marché en temps réel pour <strong>{config.name}</strong>, sans créer de compte.
          </p>
        </div>

        {/* Main Tool */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="shadow-2xl overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Nouvelle Analyse</CardTitle>
                    <CardDescription className="text-white/90">
                      Entrez vos données pour comparer
                    </CardDescription>
                  </div>
                </div>

                {/* ✅ SÉLECTEUR DE PAYS */}
                <div className="w-full sm:w-48">
                  <Select value={sim.locationCode} onValueChange={sim.setLocationCode}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10" aria-label="Pays">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4" aria-hidden="true" />
                         <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_CONFIGS.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name} ({c.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 lg:p-8">
              <form
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const invalid = await sim.analyze();
                  if (invalid) document.getElementById(`st-${invalid}`)?.focus();
                }}
              >
                {/* Category Selection */}
                <fieldset className="mb-8">
                  <legend className="text-base font-semibold mb-4">Catégorie</legend>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MARKET_CATEGORIES.map((cat) => {
                      const CategoryIcon = cat.icon;
                      const isSelected = sim.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => sim.setCategory(cat.id)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                              : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`h-10 w-10 ${cat.color} rounded-lg flex items-center justify-center mb-2 mx-auto text-white`}>
                            <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="text-xs font-semibold text-gray-900">{cat.title}</div>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Input Form */}
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="st-amount" className="mb-2 block">Montant actuel ({config.currency}/mois)</Label>
                      <Input
                        id="st-amount"
                        name="monthly-amount"
                        autoComplete="off"
                        aria-invalid={sim.fieldError?.field === 'amount'}
                        aria-describedby={sim.fieldError?.field === 'amount' ? 'st-amount-error' : undefined}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        placeholder="Ex : 140"
                        value={sim.currentAmount}
                        onChange={(e) => sim.setCurrentAmount(e.target.value)}
                        className="h-12 text-lg"
                      />
                      {sim.fieldError?.field === 'amount' && (
                        <p id="st-amount-error" className="mt-1.5 text-sm text-red-600">{sim.fieldError.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="st-household" className="mb-2 block">Taille du foyer</Label>
                      <Input
                        id="st-household"
                        name="household-size"
                        autoComplete="off"
                        aria-invalid={sim.fieldError?.field === 'household'}
                        aria-describedby={sim.fieldError?.field === 'household' ? 'st-household-error' : undefined}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        placeholder="Ex : 4"
                        value={sim.householdSize}
                        onChange={(e) => sim.setHouseholdSize(e.target.value)}
                        className="h-12 text-lg"
                      />
                      {sim.fieldError?.field === 'household' && (
                        <p id="st-household-error" className="mt-1.5 text-sm text-red-600">{sim.fieldError.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="st-details">Détails (optionnel)</Label>
                      <span className="text-xs text-muted-foreground" aria-live="polite">{sim.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
                    </div>
                    <Textarea
                      id="st-details"
                        name="details"
                        autoComplete="off"
                      placeholder="Ex : 80m², chauffage élec, option TV…"
                      value={sim.description}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      onChange={(e) => sim.setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!sim.canAnalyze}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                  >
                    {sim.status === 'loading' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> : <Brain className="mr-2 h-5 w-5" aria-hidden="true" />}
                    {sim.status === 'loading' ? 'Analyse du marché…' : "Lancer l'analyse"}
                  </Button>
                </div>
              </form>

              {/* Results */}
              <div ref={resultsRef} className="scroll-mt-24" aria-live="polite">
                {sim.status !== 'idle' && (
                  <div className="mt-12 animate-slide-up border-t pt-8">
                    {sim.status === 'loading' ? (
                      <div className="text-center py-8">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping motion-reduce:hidden"></div>
                          <Brain className="h-12 w-12 text-primary relative z-10" aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">{loadingMessage(sim.elapsed, config.name)}</p>
                        <p className="mt-1 text-xs text-gray-400">Généralement moins de 15 secondes</p>
                      </div>
                    ) : sim.status === 'error' ? (
                      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700" role="alert">
                        <AlertTriangle className="h-10 w-10 mb-2 mx-auto" aria-hidden="true" />
                        <p>{sim.error}</p>
                        <Button variant="outline" className="mt-4" onClick={() => sim.analyze()} disabled={!sim.canAnalyze}>
                          Réessayer
                        </Button>
                      </div>
                    ) : sim.result && sim.result.competitors.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {sim.result.competitors.map((offer, idx) => (
                          <div key={idx} className={`bg-white rounded-xl p-6 shadow-lg border-2 flex flex-col ${idx === 0 ? 'border-green-400 ring-4 ring-green-50' : 'border-gray-100'}`}>
                            {idx === 0 && <Badge className="mb-4 self-start bg-green-500 hover:bg-green-600 border-0">🏆 Meilleur choix</Badge>}
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{offer.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{offer.best_offer}</p>

                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-3xl font-bold text-primary">{formatMoney(offer.typical_price, config.symbol, config.currency)}</span>
                              <span className="text-sm text-gray-500">/mois</span>
                            </div>
                            <p className="mb-4 text-sm font-semibold text-green-700">
                              Économie : {formatMoney(monthlySaving(offer.potential_savings), config.symbol, config.currency)}/mois
                              <span className="font-normal text-green-600 whitespace-nowrap"> · {formatMoney(offer.potential_savings, config.symbol, config.currency)}/an</span>
                            </p>

                            <div className="space-y-2 mb-6">
                              {offer.pros.slice(0, 3).map((pro, i) => (
                                <div key={i} className="flex gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                  <span>{pro}</span>
                                </div>
                              ))}
                            </div>

                            <Button
                              variant={idx === 0 ? "default" : "outline"}
                              className="w-full mt-auto"
                              onClick={() => window.open(offer.website_url || offer.affiliate_link, '_blank', 'noopener,noreferrer')}
                            >
                              Voir l'offre <Globe className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PartyPopper className="h-10 w-10 mx-auto mb-3 text-green-600" aria-hidden="true" />
                        <p className="font-semibold text-gray-900">Bonne nouvelle : votre tarif est déjà compétitif.</p>
                        <p className="text-sm text-gray-500 mt-1">
                          L'IA n'a pas trouvé d'offre équivalente moins chère en {config.name}. Précisez les détails pour affiner.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

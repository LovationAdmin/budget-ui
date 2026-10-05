// Widget « Simulateur d'économies » de la page d'accueil (sans compte).
// Logique partagée avec la page Outils IA (useSavingsSimulator).
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

export default function SmartToolsWidget() {
  const sim = useSavingsSimulator();
  const { config } = sim;

  return (
    <Card className="shadow-2xl overflow-hidden border-0 w-full">
      <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Simulateur d'Économies</CardTitle>
              <CardDescription className="text-white/90">
                Analysez vos factures en temps réel
              </CardDescription>
            </div>
          </div>

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

      <CardContent className="p-6 lg:p-8 bg-white">
        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const invalid = await sim.analyze();
            if (invalid) document.getElementById(`w-${invalid}`)?.focus();
          }}
        >
          <fieldset className="mb-8">
            <legend className="text-base font-semibold mb-4">Quelle dépense analyser ?</legend>
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

          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="w-amount" className="mb-2 block">Montant actuel ({config.currency}/mois)</Label>
                <Input
                  id="w-amount"
                        name="monthly-amount"
                        autoComplete="off"
                        aria-invalid={sim.fieldError?.field === 'amount'}
                        aria-describedby={sim.fieldError?.field === 'amount' ? 'w-amount-error' : undefined}
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
                        <p id="w-amount-error" className="mt-1.5 text-sm text-red-600">{sim.fieldError.message}</p>
                      )}
              </div>
              <div>
                <Label htmlFor="w-household" className="mb-2 block">Taille du foyer (pers.)</Label>
                <Input
                  id="w-household"
                        name="household-size"
                        autoComplete="off"
                        aria-invalid={sim.fieldError?.field === 'household'}
                        aria-describedby={sim.fieldError?.field === 'household' ? 'w-household-error' : undefined}
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
                        <p id="w-household-error" className="mt-1.5 text-sm text-red-600">{sim.fieldError.message}</p>
                      )}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="w-details">Détails (optionnel)</Label>
                <span className="text-xs text-muted-foreground">{sim.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
              </div>
              <Textarea
                id="w-details"
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
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-lg"
            >
              {sim.status === 'loading' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> : <Brain className="mr-2 h-5 w-5" aria-hidden="true" />}
              {sim.status === 'loading' ? 'Analyse du marché…' : 'Trouver des économies'}
            </Button>
          </div>
        </form>

        <div aria-live="polite">
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
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2 text-center uppercase tracking-wide">Résultats trouvés par l'IA</p>
                  {sim.result.competitors.slice(0, 2).map((offer, idx) => (
                    <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-2 ${idx === 0 ? 'border-green-400 bg-green-50/30' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{offer.name}</h3>
                          <p className="text-xs text-gray-500">{offer.best_offer}</p>
                        </div>
                        {idx === 0 && <Badge className="bg-green-600 border-0 shrink-0">Meilleur choix</Badge>}
                      </div>

                      <div className="flex flex-wrap items-end gap-x-2 gap-y-1 mb-3">
                        <span className="text-2xl font-bold text-primary">{formatMoney(offer.typical_price, config.symbol, config.currency)}</span>
                        <span className="text-xs text-gray-500 mb-1">/mois</span>
                        <span className="ml-auto text-sm font-semibold text-green-700">
                          Économie : {formatMoney(monthlySaving(offer.potential_savings), config.symbol, config.currency)}/mois
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        {offer.pros.slice(0, 2).map((pro, i) => (
                          <div key={i} className="flex gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => window.open(offer.website_url || offer.affiliate_link, '_blank', 'noopener,noreferrer')}
                      >
                        Voir l'offre <Globe className="ml-2 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PartyPopper className="h-10 w-10 mx-auto mb-3 text-green-600" aria-hidden="true" />
                  <p className="font-semibold text-gray-900">Bonne nouvelle : votre tarif est déjà compétitif.</p>
                  <p className="text-sm text-gray-500 mt-1">Aucune offre équivalente moins chère trouvée pour ces critères.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

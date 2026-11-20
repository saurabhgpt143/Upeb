import React, { useState } from 'react';
import {
  Building2,
  User,
  Landmark,
  FileCheck2,
  CalendarClock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
  Sparkles,
  Tag,
  Mail,
} from 'lucide-react';
import {
  ProposalSettings,
  ProposalComputedData,
  UPEB_MG_PRESET,
  GR_INFRA_PRESET,
  MATERIAL_DESIGN_SPECS,
  WORK_SCHEDULE_ROWS,
} from '../utils/proposalPdf';

interface ProposalContractSectionProps {
  settings: ProposalSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProposalSettings>>;
  data: ProposalComputedData;
  onApplySampleShed: () => void;
}

const fmtINR = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

export function ProposalContractSection({
  settings,
  setSettings,
  data,
  onApplySampleShed,
}: ProposalContractSectionProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [activeProposalTab, setActiveProposalTab] = useState<'commercial' | 'scope' | 'design' | 'payment' | 'terms'>('commercial');

  const { specs } = data;
  const widthFt = (specs.width * 3.28084).toFixed(1);
  const lengthFt = (specs.length * 3.28084).toFixed(1);
  const heightFt = (specs.eaveHeight * 3.28084).toFixed(1);
  const slopeRatio = specs.roofSlope > 0 ? `1:${Math.round(100 / specs.roofSlope)}` : 'Flat';
  const unitLabel = data.dimensionUnit === 'ft' ? 'SQFT' : 'SQM';
  const qtyDisplay = data.dimensionUnit === 'ft' ? Math.round(data.areaSqFt) : Math.round(data.areaSqM);
  const rateDisplay = qtyDisplay > 0 ? (data.supplyAmountBeforeGst / qtyDisplay).toFixed(1) : '0.0';

  const supplyBaseForSched = settings.includeCivilInQuote
    ? data.supplyWithGst + data.civilAmountBeforeGst * 1.18
    : data.supplyWithGst;

  const updateField = <K extends keyof ProposalSettings>(key: K, value: ProposalSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
      {/* Official Company Letterhead Preview Strip */}
      {settings.companyLogoUrl && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <img
            src={settings.companyLogoUrl}
            alt="M.G. Industries Letterhead"
            className="w-full max-h-28 object-contain mx-auto"
          />
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">
              {settings.companyName} <span className="font-normal text-blue-600">— {settings.companyTagline}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              GSTIN: {settings.companyGstin} • Udyam: {settings.companyUdyam}
            </span>
          </div>
        </div>
      )}

      {/* Always-Visible Client & Material Brands Specification Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Proposal Client & Material Brand Specifications
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter client details and preferred brands below — automatically synced to the Scope, Supply List, and 9-Page Proposal PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onApplySampleShed}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Apply 127ft x 140ft x 25ft Single Slope Factory Shed specs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load 127ft×140ft Factory Shed
            </button>
            <button
              type="button"
              onClick={() => setShowEditor((v) => !v)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {showEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showEditor ? 'Hide Company & Bank Settings' : 'Company, Scope & Bank Settings'}
            </button>
          </div>
        </div>

        {/* Client Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Client Name (M/s)
            </label>
            <input
              type="text"
              value={settings.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              placeholder="e.g. M/s – Prashant Patel"
              className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              Client Email
            </label>
            <input
              type="email"
              value={settings.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              placeholder="e.g. client@company.com"
              className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Client Address / Site</label>
            <input
              type="text"
              value={settings.clientAddress}
              onChange={(e) => updateField('clientAddress', e.target.value)}
              placeholder="e.g. Jabalpur (M.P.)"
              className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/40"
            />
          </div>
        </div>

        {/* Roofing, Cladding & Accessories Brands */}
        <div className="pt-3 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            Roofing, Cladding & Accessories Brands
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Roofing Sheet Brand</label>
              <input
                type="text"
                list="roofing-brands-list"
                value={settings.roofingBrand}
                onChange={(e) => updateField('roofingBrand', e.target.value)}
                placeholder="e.g. JSW BGL AZ150 (0.50mm)"
                className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="roofing-brands-list">
                <option value="JSW BGL AZ150 (0.50mm)" />
                <option value="Tata BlueScope Durashine (0.50mm)" />
                <option value="AM/NS India (0.50mm)" />
                <option value="Jindal Sabrang (0.50mm)" />
                <option value="Bhushan / Essar Galvalume (0.50mm)" />
              </datalist>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Cladding / Wall Sheet Brand</label>
              <input
                type="text"
                list="cladding-brands-list"
                value={settings.claddingBrand}
                onChange={(e) => updateField('claddingBrand', e.target.value)}
                placeholder="e.g. JSW (0.50mm)"
                className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="cladding-brands-list">
                <option value="JSW (0.50mm)" />
                <option value="Tata BlueScope (0.50mm)" />
                <option value="AM/NS India (0.50mm)" />
                <option value="Jindal Colouron+ (0.50mm)" />
                <option value="Bhushan Steel (0.47mm)" />
              </datalist>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Accessories & Flashings Brand</label>
              <input
                type="text"
                list="accessories-brands-list"
                value={settings.accessoriesBrand}
                onChange={(e) => updateField('accessoriesBrand', e.target.value)}
                placeholder="e.g. JSW / M.G. Industries Standard"
                className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="accessories-brands-list">
                <option value="JSW / M.G. Industries Standard" />
                <option value="Tata BlueScope Accessories" />
                <option value="Corroshield / Buildex Fasteners & JSW Trims" />
                <option value="M.G. Industries Custom Fabricated" />
              </datalist>
            </div>
          </div>
        </div>

        {/* Pipe & Section Brands */}
        <div className="pt-3 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Pipe & Structural Section Brands
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Pipe Brand (MS Pipe / Tubular / Purlin)</label>
              <input
                type="text"
                list="pipe-brands-list"
                value={settings.pipeBrand}
                onChange={(e) => updateField('pipeBrand', e.target.value)}
                placeholder="e.g. APL Apollo / Surya / Jindal"
                className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="pipe-brands-list">
                <option value="APL Apollo / Surya / Jindal" />
                <option value="APL Apollo Structural Pipes" />
                <option value="Tata Structura" />
                <option value="Jindal Hisar / Surya Roshni" />
                <option value="JSW GI Z-Purlin & APL Apollo" />
              </datalist>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Section Brand (Plates / Beams / Channels / Angles)</label>
              <input
                type="text"
                list="section-brands-list"
                value={settings.sectionBrand}
                onChange={(e) => updateField('sectionBrand', e.target.value)}
                placeholder="e.g. JSW / TATA / SAIL"
                className="p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="section-brands-list">
                <option value="JSW / TATA / SAIL" />
                <option value="SAIL / Jindal Panther" />
                <option value="TATA Steel / JSW Steel" />
                <option value="RINL Vizag Steel / SAIL" />
                <option value="Raipur / Raigarh Rolling Mill (ISI)" />
              </datalist>
            </div>
          </div>
        </div>

        {/* Scope Toggles */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={settings.includeErectionInQuote}
              onChange={(e) => updateField('includeErectionInQuote', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            Include Erection / Sheeting in Commercial Quote (Part B)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={settings.includeCivilInQuote}
              onChange={(e) => updateField('includeCivilInQuote', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            Include Civil Foundation in Quote Total (Normally Excluded)
          </label>
        </div>

        {/* Collapsible Advanced Editor (Letterhead, Scope Metadata, Bank Details) */}
        {showEditor && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-5 bg-slate-50/70 -mx-5 px-5 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Letterhead Preset:</span>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, ...UPEB_MG_PRESET }))}
                className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                  settings.companyName.includes('M.G.') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                M.G. Industries: UPEB
              </button>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, ...GR_INFRA_PRESET }))}
                className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                  settings.companyName === 'GR INFRA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                GR INFRA Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proposal Scope Metadata */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                  Proposal Metadata
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Ref No.</label>
                      <input type="text" value={settings.proposalRefNo} onChange={(e) => updateField('proposalRefNo', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Date</label>
                      <input type="text" value={settings.proposalDate} onChange={(e) => updateField('proposalDate', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">Subject</label>
                    <input type="text" value={settings.proposalSubject} onChange={(e) => updateField('proposalSubject', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Usage</label>
                      <input type="text" value={settings.buildingUsage} onChange={(e) => updateField('buildingUsage', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Canopy (nos)</label>
                      <input type="number" min={0} value={settings.canopyCount} onChange={(e) => updateField('canopyCount', Math.max(0, Number(e.target.value)))} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Brick Wall</label>
                      <input type="text" value={settings.brickWallHeight} onChange={(e) => updateField('brickWallHeight', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">End Frames</label>
                      <select value={settings.endFramesType} onChange={(e) => updateField('endFramesType', e.target.value as any)} className="w-full p-1.5 border border-slate-300 rounded bg-white">
                        <option value="Non expandable">Non expandable</option>
                        <option value="Expandable">Expandable</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  Company Letterhead
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Company Name</label>
                      <input type="text" value={settings.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Tagline</label>
                      <input type="text" value={settings.companyTagline} onChange={(e) => updateField('companyTagline', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">GSTIN</label>
                      <input type="text" value={settings.companyGstin} onChange={(e) => updateField('companyGstin', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Udyam Reg No.</label>
                      <input type="text" value={settings.companyUdyam} onChange={(e) => updateField('companyUdyam', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">Address</label>
                    <input type="text" value={settings.companyAddress} onChange={(e) => updateField('companyAddress', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Phone</label>
                      <input type="text" value={settings.companyPhone} onChange={(e) => updateField('companyPhone', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Email</label>
                      <input type="text" value={settings.companyEmail} onChange={(e) => updateField('companyEmail', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">Fax</label>
                      <input type="text" value={settings.companyFax} onChange={(e) => updateField('companyFax', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-medium block mb-0.5">State</label>
                      <input type="text" value={settings.companyState} onChange={(e) => updateField('companyState', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  Bank & UPI Details (Page 8)
                </h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">Bank Name</label>
                    <input type="text" value={settings.bankName} onChange={(e) => updateField('bankName', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">Branch</label>
                    <input type="text" value={settings.bankBranch} onChange={(e) => updateField('bankBranch', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">Account Number</label>
                    <input type="text" value={settings.bankAccountNo} onChange={(e) => updateField('bankAccountNo', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">IFSC Code</label>
                    <input type="text" value={settings.bankIfsc} onChange={(e) => updateField('bankIfsc', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-0.5">UPI ID</label>
                    <input type="text" value={settings.bankUpiId} onChange={(e) => updateField('bankUpiId', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {[
          { id: 'commercial', label: 'Commercial Quote (Page 3)' },
          { id: 'scope', label: 'Scope & Supply List (Pages 1–2)' },
          { id: 'design', label: 'Design & Material Specs (Page 4)' },
          { id: 'payment', label: 'Payment & Work Schedule (Pages 5–6)' },
          { id: 'terms', label: 'Terms & Bank Details (Pages 6–8)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveProposalTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeProposalTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COMMERCIAL QUOTE */}
      {activeProposalTab === 'commercial' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Description of work</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3 font-medium">
                    A - Designing, Fabrication of Steel Structure & PCP sheets Along with the Transportation
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{qtyDisplay.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">{unitLabel}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{rateDisplay}/-</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmtINR(data.supplyAmountBeforeGst)}/-</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">B – Erection / sheeting</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {settings.includeErectionInQuote ? Math.round(data.totalSteelWeightMT * 1000).toLocaleString('en-IN') : 'NA'}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">KGS</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {settings.includeErectionInQuote && data.totalSteelWeightMT > 0
                      ? `₹${(data.erectionAmountBeforeGst / (data.totalSteelWeightMT * 1000)).toFixed(1)}/-`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {settings.includeErectionInQuote ? `${fmtINR(data.erectionAmountBeforeGst)}/-` : 'NA'}
                  </td>
                </tr>
                {settings.includeCivilInQuote && (
                  <tr>
                    <td className="px-4 py-3 font-medium">C – Civil Foundation Estimate</td>
                    <td className="px-4 py-3 text-right font-mono">{qtyDisplay.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{unitLabel}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹{qtyDisplay > 0 ? (data.civilAmountBeforeGst / qtyDisplay).toFixed(1) : '0'}/-
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmtINR(data.civilAmountBeforeGst)}/-</td>
                  </tr>
                )}
                <tr className="bg-slate-100/70 font-semibold text-slate-800">
                  <td colSpan={4} className="px-4 py-3">
                    {settings.includeCivilInQuote ? 'Total (A + B + C)' : 'Total (A + B)'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{fmtINR(data.totalBeforeGst)}/-</td>
                </tr>
                <tr className="bg-blue-50/60 font-bold text-slate-900">
                  <td colSpan={4} className="px-4 py-3">Final amount with 18% GST</td>
                  <td className="px-4 py-3 text-right font-mono text-base text-blue-700">{fmtINR(data.grandTotalWithGst)}/-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1">Structural Notes</div>
              <p className="font-semibold">• NOTE – The estimated weight of the structure is {data.totalSteelWeightMT.toFixed(1)} MT (metric ton)</p>
              <p>• TURBO VENT – ₹{data.turboVentUnitRate.toLocaleString('en-IN')} EACH</p>
              <p>• PCP SHEET – ₹{data.pcpSheetUnitRate.toLocaleString('en-IN')} EACH</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1">Tax and Duties</div>
              <p>• Our Rates are Ex-site.</p>
              <p>• If there is any change in other statutory taxes / duties or GST in the currency of works, they will be charged extra in full.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCOPE OF SUPPLY & LIST OF SUPPLY ITEMS */}
      {activeProposalTab === 'scope' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 uppercase tracking-wider">
                Scope of Supply & Basic Description
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  ['Client / Email', `${settings.clientName || 'Not specified'} (${settings.clientEmail || 'NA'})`],
                  ['Quantity / Usage', `${settings.buildingQuantity} — ${settings.buildingUsage}`],
                  ['Covered Area', `${Math.round(data.areaSqFt).toLocaleString('en-IN')} SQ.FT. (${Math.round(data.areaSqM).toLocaleString('en-IN')} SQ.M.)`],
                  ['Frame Type', specs.frameType],
                  ['Width × Length × Height', `${widthFt}ft × ${lengthFt}ft × ${heightFt}ft (${specs.width.toFixed(2)}m × ${specs.length.toFixed(2)}m × ${specs.eaveHeight.toFixed(2)}m)`],
                  ['Brick Wall / End Frames', `${settings.brickWallHeight} / ${settings.endFramesType}`],
                  ['Roof Slope', `${slopeRatio} (${specs.roofType})`],
                  ['Bay Spacing', `${Math.max(1, data.numFrames - 1)} @ ${data.baySpacing.toFixed(3)}M c/c of steel line`],
                  ['End Wall Bay Spacing', `${data.endBayCount} @ ${data.endBaySpacing.toFixed(3)}M c/c of steel line`],
                  ['Pipe & Section Brands', `Pipes: ${settings.pipeBrand || 'Standard'} | Sections: ${settings.sectionBrand || 'Standard'}`],
                  ['Roofing Brand', specs.hasRoof !== false ? `${settings.roofingBrand || '0.50mm JSW BGL'} (${specs.roofProfile || '6v'})` : 'N/A'],
                  ['Cladding Brand', specs.hasWalls !== false ? `${settings.claddingBrand || '0.50mm JSW'} (${specs.wallProfile || '7v'})` : 'N/A'],
                  ['Accessories Brand', settings.accessoriesBrand || 'Standard'],
                  ['Canopy', settings.canopyCount > 0 ? `${settings.canopyCount} nos` : 'N/A'],
                  ['Loadings', `DL: 20, LL: ${specs.snowLoad ? '100' : '75'} kg/m², Wind: ${specs.highWindVelocity ? '50' : '39'} m/sec`],
                ].map(([lbl, val], idx) => (
                  <div key={idx} className="px-4 py-2 flex justify-between gap-4">
                    <span className="text-slate-500 font-medium shrink-0">{lbl}</span>
                    <span className="text-slate-800 font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                List of Supply Items
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">A - STRUCTURE</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Portal frame & sections: {specs.hasPrimarySteel !== false ? `Built-up Plate / Section (${settings.sectionBrand || 'JSW / TATA / SAIL'}) - YST-350MPA (MIN)` : 'N/A'}</li>
                  <li>Pipes, Roof, Side & Gable Girt: {specs.hasSecondarySteel !== false ? `MS Pipe / GI Z Purlin (${settings.pipeBrand || 'APL Apollo / Surya / Jindal'}) - YST-350 MPA` : 'N/A'}</li>
                  <li>Wind braces: Rafter and tie level of beams and columns</li>
                  <li>Foundation bolts (MS round black), Sag rods (MS round 12 dia), Fasteners (MS/HSFG nut-bolts)</li>
                </ul>
                <div className="font-semibold text-slate-800 pt-2">B - SHEETS AND ACCESSORIES</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Sheets for roof: {specs.hasRoof !== false ? settings.roofingBrand || '0.50mm JSW BGL' : 'N/A'}</li>
                  <li>Sides, Gable & Cladding: {specs.hasWalls !== false ? settings.claddingBrand || '0.50mm JSW' : 'N/A'}</li>
                  <li>Accessories & Flashings Brand: {settings.accessoriesBrand || 'Standard'}</li>
                  <li>Eave gutter with downpipe: {specs.hasGutters !== false ? 'Included' : 'N/A'}</li>
                  <li>Self-threading screws, pop rivet & silicone sealant</li>
                  <li>Colour coat scheme: Roof ({data.roofColorName}), Wall ({data.wallColorName})</li>
                </ul>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-1.5 text-slate-700">
              <div className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Exclusions
              </div>
              <p>• Any product or service not clearly specified in this proposal.</p>
              <p>• The work excludes any kind of civil work such as foundation, grouting, flooring, brick work, joineries, etc.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DESIGN & MATERIAL SPECIFICATIONS */}
      {activeProposalTab === 'design' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            <strong>Design –</strong> The design, supply and fabrication of all the structural members will be made as per your approved drawings and specifications.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                <tr>
                  <th className="px-3 py-2.5 text-left w-14">S. No.</th>
                  <th className="px-3 py-2.5 text-left">Materials</th>
                  <th className="px-3 py-2.5 text-left">Specifications</th>
                  <th className="px-3 py-2.5 text-left">Yield strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {MATERIAL_DESIGN_SPECS.map((row) => (
                  <tr key={row.sno}>
                    <td className="px-3 py-2 font-mono">{row.sno}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.material}</td>
                    <td className="px-3 py-2">{row.spec}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-slate-800">{row.yield}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT SCHEDULE & WORK SCHEDULE */}
      {activeProposalTab === 'payment' && (
        <div className="space-y-6">
          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">A. Supply Payment Schedule (Including 18% GST)</h5>
            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Description</th>
                    <th className="px-4 py-2.5 text-center font-medium">Day</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount (including GST 18%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-2.5">50% after dumping of pipe and other fabrication material (except sheet)</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Day 1</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{fmtINR(supplyBaseForSched * 0.5)}/-</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2.5">35% Payment before dispatch of truss</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Day 20 to day 30</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{fmtINR(supplyBaseForSched * 0.35)}/-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Remaining 15% payment before dispatch of Sheet</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Day 30 to day 40</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{fmtINR(supplyBaseForSched * 0.15)}/-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">B. Erection Payment Schedule (Includes 18% GST)</h5>
            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Description</th>
                    <th className="px-4 py-2.5 text-center font-medium">Day</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount (includes 18% GST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-2.5">30% payment before the start of the Erection</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Advance</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {settings.includeErectionInQuote ? `${fmtINR(data.erectionWithGst * 0.3)}/-` : 'NA'}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2.5">60% payment after completion of erection</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Day 35</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {settings.includeErectionInQuote ? `${fmtINR(data.erectionWithGst * 0.6)}/-` : 'NA'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">10% after completion of sheeting and Accessories</td>
                    <td className="px-4 py-2.5 text-center text-xs font-medium">Day 45-50</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {settings.includeErectionInQuote ? `${fmtINR(data.erectionWithGst * 0.1)}/-` : 'NA'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
              Work Schedule (Days)
            </h5>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Activity</th>
                    <th className="px-4 py-2 text-center">Start Day</th>
                    <th className="px-4 py-2 text-center">End Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {WORK_SCHEDULE_ROWS.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-medium">{row.activity}</td>
                      <td className="px-4 py-2 text-center font-mono">{row.start}</td>
                      <td className="px-4 py-2 text-center font-mono">{row.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TERMS AND CONDITIONS & BANK DETAILS */}
      {activeProposalTab === 'terms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
            <h5 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Terms and Conditions
            </h5>
            <p><strong className="text-slate-800">Confirmation of Order –</strong> The order is confirmed once we receive the 50% clean advance as mentioned in payment terms.</p>
            <p><strong className="text-slate-800">Delivery Period –</strong> After receiving the 50% clean advance, purchase order is placed for procuring the materials required. The commencement of the structural dispatches is subject to civil works and so is the completion time. Payment is the essence of contract and any deviation from payment schedule will affect the timeline of works. It shall take up to 20 - 25 days for completion.</p>
            <p><strong className="text-slate-800">Painting –</strong> The structure will have two coats of Direct to Metal (DTM) (BERGER INDUSTRIAL PAINTS) prior to dispatches.</p>
            <p><strong className="text-slate-800">Validity –</strong> Our Rates are valid for 3 days & subject to our confirmation thereafter.</p>
            <p><strong className="text-slate-800">Force majeure –</strong> Standard force majeure condition will apply.</p>
            <p><strong className="text-slate-800">Price escalation –</strong> If there are any major changes (+/- 4%) in the price during the currency of works, there will be a revision in the supply prices.</p>
            <p><strong className="text-slate-800">Inspection –</strong> The finished goods will be inspected by your authorized representative at our works. Our responsibility regarding dimensional correctness shall be ceased after the inspection.</p>
            <p><strong className="text-slate-800">Facilities required –</strong> Nominal amenities such as workmen rest shelter with water / electricity at site on no-cost basis will be provided during full currency of work.</p>
            <p><strong className="text-slate-800">Erection / sheeting –</strong> Erection and sheeting means lifting of the structures to their respective position, excluding any civil works such as foundation bolts grouting, flooring, etc.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
            <h5 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-600" />
              Bank & UPI Details
            </h5>
            <div className="space-y-2.5 text-slate-700">
              <div>
                <span className="text-slate-500 block">Bank Name</span>
                <span className="font-semibold text-slate-900">{settings.bankName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Branch</span>
                <span className="font-semibold text-slate-900">{settings.bankBranch || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Account Number</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">{settings.bankAccountNo || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">IFSC Code</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">{settings.bankIfsc || 'Not specified'}</span>
              </div>
              {settings.bankUpiId && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">UPI ID</span>
                  <span className="font-mono font-semibold text-blue-700 text-sm">{settings.bankUpiId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

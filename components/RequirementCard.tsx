import React from 'react';
import { Requirement, TagColor } from '../types';
import { CheckCircle2, ShieldCheck, Layers, Workflow, Code2, Terminal } from 'lucide-react';

interface Props {
  requirement: Requirement;
}

const TagBadge: React.FC<{ label: string; color: TagColor }> = ({ label, color }) => {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colorStyles[color]} mr-2 mb-2`}>
      {label}
    </span>
  );
};

const IconMap: Record<string, React.ReactNode> = {
  '1': <Terminal className="w-5 h-5 text-blue-600" />,
  '2': <Workflow className="w-5 h-5 text-blue-600" />,
  '3': <ShieldCheck className="w-5 h-5 text-blue-600" />,
  '4': <Code2 className="w-5 h-5 text-blue-600" />,
  '5': <Layers className="w-5 h-5 text-blue-600" />,
  '6': <CheckCircle2 className="w-5 h-5 text-blue-600" />,
};

export const RequirementCard: React.FC<Props> = ({ requirement }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      <div className="md:flex">
        {/* Header Section */}
        <div className="md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-3">
            {IconMap[requirement.id] || <Layers className="w-5 h-5 text-blue-600" />}
            <h3 className="text-lg font-bold text-slate-900">{requirement.category}</h3>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            {requirement.subLabel}
          </p>
          <div className="mb-4">
            {requirement.principles.tags.map((tag, idx) => (
              <TagBadge key={idx} label={tag.label} color={tag.color} />
            ))}
          </div>
          <p className="text-sm text-slate-600 italic">
            "{requirement.principles.description}"
          </p>
        </div>

        {/* Details Section */}
        <div className="md:w-2/3 p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">
            实施规范 (Implementation Specs)
          </h4>
          <ul className="space-y-4">
            {requirement.implementation.map((impl, idx) => (
              <li key={idx} className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full mr-3" />
                <div>
                  <span className="text-sm font-bold text-slate-800 mr-2">
                    {impl.title}:
                  </span>
                  <span className="text-sm text-slate-600 leading-relaxed">
                    {impl.details}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
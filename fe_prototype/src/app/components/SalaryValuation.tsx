import { useState } from 'react';
import { TrendingUp, DollarSign, Target, Sparkles, Upload, Link as LinkIcon } from 'lucide-react';

interface SalaryValuationProps {
  currentSalary: number;
  marketSalaryMin: number;
  marketSalaryMax: number;
  matchPercentage: number;
  missingSkills: string[];
}

export function SalaryValuation({
  currentSalary,
  marketSalaryMin,
  marketSalaryMax,
  matchPercentage,
  missingSkills
}: SalaryValuationProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'cv' | 'linkedin' | null>(null);

  const formatSalary = (amount: number) => {
    return `${(amount / 1000000).toFixed(0)}M`;
  };

  const potentialIncrease = marketSalaryMax - currentSalary;
  const increasePercentage = ((potentialIncrease / currentSalary) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Upload Options */}
      {!showAnalysis ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Market Valuation
            </h2>
            <p className="text-gray-600">
              Định giá năng lực của bạn với AI
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => {
                setUploadMethod('linkedin');
                setShowAnalysis(true);
              }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Paste LinkedIn URL</div>
                <div className="text-sm text-gray-600">Phân tích từ hồ sơ LinkedIn</div>
              </div>
            </button>

            <button
              onClick={() => {
                setUploadMethod('cv');
                setShowAnalysis(true);
              }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Upload CV</div>
                <div className="text-sm text-gray-600">Tải lên CV hiện tại của bạn</div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI Analysis Report */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-violet-900">Báo cáo phân tích AI</h3>
            </div>

            {/* Current vs Market Salary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Lương hiện tại</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatSalary(currentSalary)} VND
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Mức thị trường</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatSalary(marketSalaryMin)} - {formatSalary(marketSalaryMax)}
                </div>
              </div>
            </div>

            {/* Potential Increase */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Tiềm năng tăng lương</div>
                  <div className="text-3xl font-bold">
                    +{formatSalary(potentialIncrease)}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    (+{increasePercentage}% so với hiện tại)
                  </div>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </div>

            {/* Match Percentage */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Độ phù hợp kỹ năng</span>
                <span className="text-lg font-bold text-gray-900">{matchPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Kỹ năng cần bổ sung để tăng deal lương:
                </span>
              </div>
              <div className="space-y-2">
                {missingSkills.map((skill) => (
                  <div key={skill} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowAnalysis(false)}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Phân tích lại
          </button>
        </>
      )}
    </div>
  );
}

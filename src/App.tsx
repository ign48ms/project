import { useState } from 'react';
import InputSection from './components/InputSection';
import ResultsDisplay from './components/ResultsDisplay';
import {
  normalizeMatrix,
  calculateConcordanceMatrix,
  calculateDiscordanceMatrix,
  calculateOutrankingMatrix,
  extractKernel,
  validateInputs,
  generateRecommendation,
} from './utils/electre';

function App() {
  const [results, setResults] = useState<{
    concordanceMatrix: number[][];
    discordanceMatrix: number[][];
    outrankingMatrix: boolean[][];
    kernel: number[];
    recommendation: Array<{ index: number; dominationCount: number; rank: number }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (data: {
    performanceMatrix: number[][];
    weights: number[];
    concordanceThreshold: number;
    discordanceThreshold: number;
    criteriaTypology: string[];
    customMin?: (number | null)[];
    customMax?: (number | null)[];
    weightsPreNormalized?: boolean;
  }) => {
    setError(null);

    const validationError = validateInputs(
      data.performanceMatrix,
      data.weights,
      data.concordanceThreshold,
      data.discordanceThreshold
    );

    if (validationError) {
      setError(validationError);
      setResults(null);
      return;
    }

    // Normalize the performance matrix once using provided or data-derived min/max
    const normalizedMatrix = normalizeMatrix(
      data.performanceMatrix,
      data.criteriaTypology,
      data.customMin || [],
      data.customMax || []
    );

    // Handle weights: if pre-normalized, use as-is; otherwise will be normalized in concordance calculation
    const weightsToUse = data.weightsPreNormalized 
      ? data.weights 
      : data.weights;

    const concordanceMatrix = calculateConcordanceMatrix(
      data.performanceMatrix,
      weightsToUse,
      data.criteriaTypology,
      data.weightsPreNormalized || false
    );

    const discordanceMatrix = calculateDiscordanceMatrix(
      normalizedMatrix
    );

    const outrankingMatrix = calculateOutrankingMatrix(
      concordanceMatrix,
      discordanceMatrix,
      data.concordanceThreshold,
      data.discordanceThreshold
    );

    const kernel = extractKernel(outrankingMatrix);

    const recommendation = generateRecommendation(kernel, outrankingMatrix);

    setResults({
      concordanceMatrix,
      discordanceMatrix,
      outrankingMatrix,
      kernel,
      recommendation,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="py-8 px-4 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ELECTRE I
            </h1>
            <p className="text-lg text-gray-600">
              Méthode d'aide à la décision multicritère
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Identification des meilleures alternatives par analyse de surclassement
            </p>
          </div>

          <InputSection onCalculate={handleCalculate} />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {results && (
            <ResultsDisplay
              concordanceMatrix={results.concordanceMatrix}
              discordanceMatrix={results.discordanceMatrix}
              outrankingMatrix={results.outrankingMatrix}
              kernel={results.kernel}
              recommendation={results.recommendation}
            />
          )}
        </div>
      </div>

      <footer className="w-screen bg-blue-600 text-center py-3">
        <p className="text-sm text-white font-semibold">
          © ZENNAKI et MENDAS. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}

export default App;

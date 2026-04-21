import { useState, useEffect } from 'react';

interface InputSectionProps {
  onCalculate: (data: {
    performanceMatrix: number[][];
    weights: number[];
    concordanceThreshold: number;
    discordanceThreshold: number;
    criteriaTypology: string[];
    customMin?: (number | null)[];
    customMax?: (number | null)[];
    weightsPreNormalized?: boolean;
  }) => void;
}

export default function InputSection({ onCalculate }: InputSectionProps) {
  const [numAlternatives, setNumAlternatives] = useState(3);
  const [numCriteria, setNumCriteria] = useState(3);
  const [performanceMatrix, setPerformanceMatrix] = useState<number[][]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [concordanceThreshold, setConcordanceThreshold] = useState(0.7);
  const [discordanceThreshold, setDiscordanceThreshold] = useState(0.3);
  const [criteriaTypology, setCriteriaTypology] = useState<string[]>([]);
  const [customMin, setCustomMin] = useState<(number | null)[]>([]);
  const [customMax, setCustomMax] = useState<(number | null)[]>([]);
  const [weightsPreNormalized, setWeightsPreNormalized] = useState(false);

  useEffect(() => {
    const newMatrix = Array(numAlternatives)
      .fill(0)
      .map(() => Array(numCriteria).fill(0));
    setPerformanceMatrix(newMatrix);

    const newWeights = Array(numCriteria).fill(0);
    setWeights(newWeights);

    const newTypology = Array(numCriteria).fill('max');
    setCriteriaTypology(newTypology);

    const newCustomMin = Array(numCriteria).fill(null);
    setCustomMin(newCustomMin);

    const newCustomMax = Array(numCriteria).fill(null);
    setCustomMax(newCustomMax);
  }, [numAlternatives, numCriteria]);

  const handleMatrixChange = (i: number, j: number, value: string) => {
    const newMatrix = [...performanceMatrix];
    newMatrix[i][j] = parseFloat(value) || 0;
    setPerformanceMatrix(newMatrix);
  };

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  const handleTypologyChange = (index: number, value: string) => {
    const newTypology = [...criteriaTypology];
    newTypology[index] = value;
    setCriteriaTypology(newTypology);
  };

  const handleCustomMinChange = (index: number, value: string) => {
    const newCustomMin = [...customMin];
    newCustomMin[index] = value === '' ? null : parseFloat(value);
    setCustomMin(newCustomMin);
  };

  const handleCustomMaxChange = (index: number, value: string) => {
    const newCustomMax = [...customMax];
    newCustomMax[index] = value === '' ? null : parseFloat(value);
    setCustomMax(newCustomMax);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      performanceMatrix,
      weights,
      concordanceThreshold,
      discordanceThreshold,
      criteriaTypology,
      customMin,
      customMax,
      weightsPreNormalized,
    });
  };

  const handleReset = () => {
    setNumAlternatives(3);
    setNumCriteria(3);
    setPerformanceMatrix(Array(3).fill(0).map(() => Array(3).fill(0)));
    setWeights(Array(3).fill(0));
    setCriteriaTypology(Array(3).fill('max'));
    setCustomMin(Array(3).fill(null));
    setCustomMax(Array(3).fill(null));
    setConcordanceThreshold(0.7);
    setDiscordanceThreshold(0.3);
    setWeightsPreNormalized(false);
  };

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuration ELECTRE I
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre d'alternatives
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={numAlternatives}
              onChange={(e) => setNumAlternatives(parseInt(e.target.value) || 2)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de critères
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={numCriteria}
              onChange={(e) => setNumCriteria(parseInt(e.target.value) || 2)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Matrice de performance
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                    Alternative
                  </th>
                  {Array(numCriteria)
                    .fill(0)
                    .map((_, j) => (
                      <th
                        key={j}
                        className="border border-gray-300 px-4 py-2 bg-gray-100"
                      >
                        Critère {j + 1}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {performanceMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">
                      A{i + 1}
                    </td>
                    {row.map((value, j) => (
                      <td key={j} className="border border-gray-300 p-1">
                        <input
                          type="number"
                          step="0.01"
                          value={value}
                          onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                          className="w-full px-2 py-1 text-center border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Caractéristiques des critères
            </h3>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md">
              <input
                type="checkbox"
                id="weightsPreNormalized"
                checked={weightsPreNormalized}
                onChange={(e) => setWeightsPreNormalized(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="weightsPreNormalized" className="text-sm text-gray-700 cursor-pointer">
                Poids pré-normalisés
              </label>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Renseignez le sens, le poids et optionnellement les bornes Min/Max de chaque critère.<br/>
            <strong>Poids :</strong> entrez n'importe quelle valeur positive — ils seront normalisés automatiquement.<br/>
            <strong>Min/Max :</strong> laissez vide pour utiliser automatiquement le min/max de vos données. Remplissez si vous imposez des bornes fixes.
          </p>
          <p className={`text-sm mb-3 ${weightsPreNormalized && Math.abs(totalWeight - 1) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
            (Somme des poids : {totalWeight.toFixed(3)}{weightsPreNormalized ? '' : ' → normalisés à 1.000'})
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">Critère</th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">Sens</th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">Poids {weightsPreNormalized ? '(normalisés)' : 'brut'}</th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">Min (optionnel)</th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">Max (optionnel)</th>
                </tr>
              </thead>
              <tbody>
                {Array(numCriteria).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">C{index + 1}</td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={criteriaTypology[index] || 'max'}
                        onChange={(e) => handleTypologyChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="max">Max</option>
                        <option value="min">Min</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="any"
                        value={weights[index] !== 0 ? weights[index] : ''}
                        onChange={(e) => handleWeightChange(index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="auto"
                        value={customMin[index] !== null ? customMin[index] : ''}
                        onChange={(e) => handleCustomMinChange(index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="auto"
                        value={customMax[index] !== null ? customMax[index] : ''}
                        onChange={(e) => handleCustomMaxChange(index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seuil de concordance (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={concordanceThreshold}
              onChange={(e) => setConcordanceThreshold(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Niveau minimum de concordance requis pour le surclassement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seuil de discordance (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={discordanceThreshold}
              onChange={(e) => setDiscordanceThreshold(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Niveau maximum de discordance autorisé pour le surclassement
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 shadow-md hover:shadow-lg"
          >
            Calculer avec ELECTRE I
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-md transition duration-200 shadow-md hover:shadow-lg"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}

import OutrankingGraph from './OutrankingGraph';

interface ResultsDisplayProps {
  concordanceMatrix: number[][];
  discordanceMatrix: number[][];
  outrankingMatrix: boolean[][];
  kernel: number[];
  recommendation: Array<{ index: number; dominationCount: number; rank: number }>;
}

export default function ResultsDisplay({
  concordanceMatrix,
  discordanceMatrix,
  outrankingMatrix,
  recommendation,
}: ResultsDisplayProps) {
  const n = concordanceMatrix.length;

  return (
    <div className="space-y-6">
      <OutrankingGraph outrankingMatrix={outrankingMatrix} />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Résultats ELECTRE I</h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
              1
            </span>
            Matrice de concordance
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            La concordance C(a,b) représente la proportion de poids des critères pour lesquels
            l'alternative 'a' est au moins aussi bonne que l'alternative 'b'.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100"></th>
                  {Array(n)
                    .fill(0)
                    .map((_, j) => (
                      <th
                        key={j}
                        className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold"
                      >
                        A{j + 1}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {concordanceMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                      A{i + 1}
                    </td>
                    {row.map((value, j) => (
                      <td
                        key={j}
                        className={`border border-gray-300 px-4 py-2 text-center ${
                          i === j ? 'bg-gray-50' : ''
                        }`}
                      >
                        {value.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
              2
            </span>
            Matrice de discordance
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            La discordance D(a,b) mesure le désaccord maximum normalisé entre 'a' et 'b' sur
            l'ensemble des critères. Une valeur élevée indique qu'il existe au moins un critère
            où 'b' est nettement meilleure que 'a'.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100"></th>
                  {Array(n)
                    .fill(0)
                    .map((_, j) => (
                      <th
                        key={j}
                        className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold"
                      >
                        A{j + 1}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {discordanceMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                      A{i + 1}
                    </td>
                    {row.map((value, j) => (
                      <td
                        key={j}
                        className={`border border-gray-300 px-4 py-2 text-center ${
                          i === j ? 'bg-gray-50' : ''
                        }`}
                      >
                        {value.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
              3
            </span>
            Matrice de surclassement
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Une alternative 'a' surclasse 'b' (noté aSb) si la concordance est suffisamment
            élevée ET la discordance est suffisamment faible. Cela signifie que 'a' est
            globalement au moins aussi bonne que 'b'.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100"></th>
                  {Array(n)
                    .fill(0)
                    .map((_, j) => (
                      <th
                        key={j}
                        className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold"
                      >
                        A{j + 1}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {outrankingMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                      A{i + 1}
                    </td>
                    {row.map((value, j) => (
                      <td
                        key={j}
                        className={`border border-gray-300 px-4 py-2 text-center ${
                          i === j
                            ? 'bg-gray-50'
                            : value
                            ? 'bg-green-100 text-green-800 font-semibold'
                            : ''
                        }`}
                      >
                        {i === j ? '-' : value ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ✓ = l'alternative en ligne surclasse celle en colonne | ✗ = pas de surclassement
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              ★
            </span>
            Noyau et Recommandation - Meilleures alternatives
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Les alternatives suivantes ne sont surclassées par aucune autre. Elles sont classées selon
            leur force de domination (nombre d'alternatives qu'elles surclassent). Ces alternatives
            constituent les meilleures choix selon la méthode ELECTRE I.
          </p>
          {recommendation.length > 0 ? (
            <div className="space-y-3">
              {recommendation.map((alt) => (
                <div
                  key={alt.index}
                  className="bg-white border-2 border-green-500 rounded-lg px-6 py-4 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {alt.rank}
                    </span>
                    <div>
                      <span className="text-lg font-bold text-gray-800">
                        Alternative A{alt.index + 1}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Domine {alt.dominationCount} alternative{alt.dominationCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {alt.rank === 1 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Recommandé
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">
                Aucune alternative dans le noyau. Toutes les alternatives sont surclassées par
                au moins une autre. Essayez d'ajuster les seuils de concordance et de
                discordance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

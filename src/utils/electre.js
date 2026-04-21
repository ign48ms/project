/**
 * Utilitaires pour la méthode ELECTRE I
 * ELECTRE I est une méthode d'aide à la décision multicritère qui permet de comparer
 * plusieurs alternatives selon différents critères et d'identifier les meilleures options.
 */

/**
 * Normalise la matrice de performance
 * Normalise chaque colonne entre 0 et 1 en utilisant les bornes min/max
 *
 * @param {number[][]} performanceMatrix - Matrice de performance brute
 * @param {string[]} criteriaTypology - Type de chaque critère ('max' ou 'min')
 * @param {(number|null)[]} customMin - Bornes min personnalisées (null = automatique)
 * @param {(number|null)[]} customMax - Bornes max personnalisées (null = automatique)
 * @returns {number[][]} Matrice normalisée
 */
export function normalizeMatrix(performanceMatrix, criteriaTypology = [], customMin = [], customMax = []) {
  const n = performanceMatrix.length;
  const m = performanceMatrix[0].length;
  const colMin = [], colMax = [];

  // Déterminer les bornes min/max pour chaque critère
  for (let j = 0; j < m; j++) {
    const vals = performanceMatrix.map(r => r[j]);
    colMin[j] = (customMin[j] !== null && customMin[j] !== undefined) ? customMin[j] : Math.min(...vals);
    colMax[j] = (customMax[j] !== null && customMax[j] !== undefined) ? customMax[j] : Math.max(...vals);
  }

  // Normaliser la matrice
  const G = [];
  for (let i = 0; i < n; i++) {
    G[i] = [];
    for (let j = 0; j < m; j++) {
      const range = colMax[j] - colMin[j] || 1;
      const typology = criteriaTypology.length === m ? criteriaTypology : Array(m).fill('max');
      G[i][j] = typology[j] === 'max'
        ? (performanceMatrix[i][j] - colMin[j]) / range
        : (colMax[j] - performanceMatrix[i][j]) / range;
    }
  }
  return G;
}

/**
 * Calcule la matrice de concordance
 * La concordance mesure dans quelle mesure l'alternative 'a' est au moins aussi bonne que 'b'
 *
 * @param {number[][]} performanceMatrix - Matrice de performance [alternatives x critères]
 * @param {number[]} weights - Poids des critères
 * @param {string[]} criteriaTypology - Type de chaque critère ('max' ou 'min')
 * @param {boolean} weightsPreNormalized - Si true, les poids sont déjà normalisés
 * @returns {number[][]} Matrice de concordance
 */
export function calculateConcordanceMatrix(performanceMatrix, weights, criteriaTypology = [], weightsPreNormalized = false) {
  const n = performanceMatrix.length;
  const m = performanceMatrix[0].length;
  
  // Si aucune typologie fournie, utiliser 'max' par défaut
  const typology = criteriaTypology.length === m 
    ? criteriaTypology 
    : Array(m).fill('max');
  
  // Normaliser les poids si nécessaire
  let normalizedWeights;
  if (weightsPreNormalized) {
    normalizedWeights = weights;
  } else {
    const rawSum = weights.reduce((sum, w) => sum + w, 0);
    normalizedWeights = weights.map(w => w / rawSum);
  }
  
  const concordanceMatrix = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (a === b) {
        concordanceMatrix[a][b] = 1;
        continue;
      }

      let concordanceSum = 0;

      // Pour chaque critère, on vérifie si l'alternative 'a' est au moins aussi bonne que 'b'
      for (let j = 0; j < normalizedWeights.length; j++) {
        let isAtLeastAsGood = false;
        
        if (typology[j] === 'max') {
          // Pour les critères à maximiser : a >= b
          isAtLeastAsGood = performanceMatrix[a][j] >= performanceMatrix[b][j];
        } else if (typology[j] === 'min') {
          // Pour les critères à minimiser : a <= b (plus bas est meilleur)
          isAtLeastAsGood = performanceMatrix[a][j] <= performanceMatrix[b][j];
        }
        
        if (isAtLeastAsGood) {
          concordanceSum += normalizedWeights[j];
        }
      }

      concordanceMatrix[a][b] = concordanceSum;
    }
  }

  return concordanceMatrix;
}

/**
 * Calcule la matrice de discordance
 * La discordance mesure dans quelle mesure l'alternative 'b' est significativement meilleure que 'a'
 * Utilise la matrice normalisée pour une comparaison cohérente
 *
 * @param {number[][]} normalizedMatrix - Matrice normalisée [alternatives x critères]
 * @returns {number[][]} Matrice de discordance
 */
export function calculateDiscordanceMatrix(normalizedMatrix) {
  const n = normalizedMatrix.length;
  const m = normalizedMatrix[0].length;

  // Global δ = max difference in normalized matrix across all criteria and pairs
  let delta = 0;
  for (let j = 0; j < m; j++)
    for (let a = 0; a < n; a++)
      for (let b = 0; b < n; b++)
        delta = Math.max(delta, Math.abs(normalizedMatrix[a][j] - normalizedMatrix[b][j]));
  if (delta === 0) delta = 1;

  const discordanceMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (a === b) continue;
      let maxDiff = 0, bBetter = false;
      for (let j = 0; j < m; j++) {
        // All criteria already flipped to "maximize" in normalized matrix
        if (normalizedMatrix[b][j] > normalizedMatrix[a][j]) {
          bBetter = true;
          maxDiff = Math.max(maxDiff, normalizedMatrix[b][j] - normalizedMatrix[a][j]);
        }
      }
      discordanceMatrix[a][b] = bBetter ? maxDiff / delta : 0;
    }
  }
  return discordanceMatrix;
}

/**
 * Construit la relation de surclassement
 * Une alternative 'a' surclasse 'b' si :
 * - C(a,b) >= seuil de concordance ET
 * - D(a,b) <= seuil de discordance
 *
 * @param {number[][]} concordanceMatrix - Matrice de concordance
 * @param {number[][]} discordanceMatrix - Matrice de discordance
 * @param {number} concordanceThreshold - Seuil de concordance (0-1)
 * @param {number} discordanceThreshold - Seuil de discordance (0-1)
 * @returns {boolean[][]} Matrice de surclassement (true = a surclasse b)
 */
export function calculateOutrankingMatrix(
  concordanceMatrix,
  discordanceMatrix,
  concordanceThreshold,
  discordanceThreshold
) {
  const n = concordanceMatrix.length;
  const outrankingMatrix = Array(n).fill(0).map(() => Array(n).fill(false));

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (a === b) {
        outrankingMatrix[a][b] = false;
        continue;
      }

      // Vérification des deux conditions de surclassement
      const concordanceCondition = concordanceMatrix[a][b] >= concordanceThreshold;
      const discordanceCondition = discordanceMatrix[a][b] <= discordanceThreshold;

      outrankingMatrix[a][b] = concordanceCondition && discordanceCondition;
    }
  }

  return outrankingMatrix;
}

/**
 * Extrait le noyau (kernel) des meilleures alternatives
 * Le noyau contient les alternatives qui ne sont surclassées par aucune autre
 * et qui forment un ensemble cohérent (pas de cycles de surclassement entre elles)
 *
 * @param {boolean[][]} outrankingMatrix - Matrice de surclassement
 * @returns {number[]} Indices des alternatives du noyau
 */
export function extractKernel(outrankingMatrix) {
  const n = outrankingMatrix.length;
  const notOutranked = [];

  // Étape 1 : Identifier les alternatives non surclassées
  for (let a = 0; a < n; a++) {
    let isOutranked = false;

    // Vérifier si l'alternative 'a' est surclassée par une autre
    for (let b = 0; b < n; b++) {
      if (b !== a && outrankingMatrix[b][a]) {
        isOutranked = true;
        break;
      }
    }

    if (!isOutranked) {
      notOutranked.push(a);
    }
  }

  // Si aucune alternative n'est non surclassée, le noyau est vide
  if (notOutranked.length === 0) {
    return [];
  }

  // Étape 2 : Vérifier qu'il n'y a pas de cycles entre les alternatives non surclassées
  // (Dans une implémentation simplifiée, on retourne directement les alternatives non surclassées)
  return notOutranked;
}

/**
 * Valide les entrées de l'utilisateur
 *
 * @param {number[][]} performanceMatrix - Matrice de performance
 * @param {number[]} weights - Poids des critères (seront normalisés automatiquement)
 * @param {number} concordanceThreshold - Seuil de concordance
 * @param {number} discordanceThreshold - Seuil de discordance
 * @returns {string|null} Message d'erreur ou null si valide
 */
export function validateInputs(
  performanceMatrix,
  weights,
  concordanceThreshold,
  discordanceThreshold
) {
  // Vérifier que la matrice n'est pas vide
  if (!performanceMatrix || performanceMatrix.length === 0) {
    return "La matrice de performance ne peut pas être vide";
  }

  // Vérifier que tous les poids sont positifs
  if (weights.some(w => w < 0)) {
    return "Les poids doivent être positifs";
  }

  // Vérifier que la somme des poids est supérieure à 0
  const sumWeights = weights.reduce((s, w) => s + w, 0);
  if (sumWeights <= 0) {
    return "La somme des poids doit être supérieure à 0";
  }

  // Vérifier les seuils
  if (concordanceThreshold < 0 || concordanceThreshold > 1) {
    return "Le seuil de concordance doit être entre 0 et 1";
  }

  if (discordanceThreshold < 0 || discordanceThreshold > 1) {
    return "Le seuil de discordance doit être entre 0 et 1";
  }

  // Vérifier que toutes les valeurs de performance sont des nombres
  for (let i = 0; i < performanceMatrix.length; i++) {
    for (let j = 0; j < performanceMatrix[i].length; j++) {
      if (isNaN(performanceMatrix[i][j])) {
        return `Valeur invalide à la ligne ${i + 1}, colonne ${j + 1}`;
      }
    }
  }

  return null;
}

/**
 * Génère une recommandation classée pour le décideur
 * Les membres du noyau sont classés selon le nombre d'alternatives qu'ils surclassent
 *
 * @param {number[]} kernel - Indices des alternatives du noyau
 * @param {boolean[][]} outrankingMatrix - Matrice de surclassement
 * @returns {Array} Tableau d'objets avec ranking et nombre de dominations
 */
export function generateRecommendation(kernel, outrankingMatrix) {
  if (kernel.length === 0) {
    return [];
  }

  // Calculer le score de domination pour chaque alternative du noyau
  const scoredAlternatives = kernel.map(altIndex => {
    let dominationCount = 0;

    // Compter combien d'alternatives cette alternative surclasse
    for (let j = 0; j < outrankingMatrix[altIndex].length; j++) {
      if (outrankingMatrix[altIndex][j]) {
        dominationCount++;
      }
    }

    return {
      index: altIndex,
      dominationCount: dominationCount,
    };
  });

  // Trier par nombre de dominations (décroissant)
  scoredAlternatives.sort((a, b) => b.dominationCount - a.dominationCount);

  // Ajouter le classement
  return scoredAlternatives.map((alt, rank) => ({
    ...alt,
    rank: rank + 1,
  }));
}

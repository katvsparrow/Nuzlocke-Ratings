module.exports = {
  countChallenges(challenges){
    let counts = {
      'Leader': 0,
      'Bronze': 0,
      'Silver': 0,
      'Gold': 0
    }
    for(challenge in challenges){
      counts[challenges[challenge].tier] += 1;
    }
    counts['Bronze'] += Math.floor(counts['Leader'] / 3);
    return counts;
  },

  qualifiedForTitle(title, challengeCounts, rating){ 
    if (
      challengeCounts['Bronze'] >= title.min_bronze_challenges &&
      challengeCounts['Silver'] >= title.min_silver_challenges &&
      challengeCounts['Gold'] >= title.min_gold_challenges &&
      rating >= title.rating_floor
    ) {
      return true;
    }
    else {
      return false;
    }
  }
}
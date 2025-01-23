const fs = require("fs");

/**
 * Generates a README.md file with LeetCode stats and submissions.
 * @param {Object} stats - The stats object containing counts of solved problems by difficulty.
 * @param {Array} submissions - An array of recent submission objects.
 */
function generateReadme(stats, submissions) {
  const readmeContent = `
# My LeetCode Stats

Hi! Here are my LeetCode stats and submissions.

## Problem Solving Summary
| Difficulty | Solved |
|------------|--------|
| Easy       | ${stats.easy} |
| Medium     | ${stats.medium} |
| Hard       | ${stats.hard} |

## Recent Submissions
| Title                                      | Difficulty | Language    | Topics                         |
|--------------------------------------------|------------|-------------|--------------------------------|
${submissions
  .map(
    (sub) =>
      `| [${sub.title}](https://leetcode.com/problems/${sub.title_slug}/) | ${
        sub.difficulty
      } | ${sub.lang} | ${sub.topicTags.join(", ")} `
  )
  .join("\n")}

---

Generated automatically by my LeetCode script.
`;

  // Save the README content to a file
  fs.writeFileSync("README.md", readmeContent);
  console.log("README.md has been updated!");
}

// Export the function
module.exports = { generateReadme };

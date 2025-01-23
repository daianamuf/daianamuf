const { generateReadme } = require("./markdown");
const axios = require("axios");
require("dotenv").config();

async function fetchProfileStats() {
  const query = `
    query {
      matchedUser(username: "${process.env.LEETCODE_USERNAME}") {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query },
      {
        headers: {
          Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;
    return {
      easy: stats.find((d) => d.difficulty === "Easy")?.count || 0,
      medium: stats.find((d) => d.difficulty === "Medium")?.count || 0,
      hard: stats.find((d) => d.difficulty === "Hard")?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching profile stats:", error.message);
    return { easy: 0, medium: 0, hard: 0 };
  }
}

async function fetchSubmissions() {
  const sessionCookie = process.env.LEETCODE_SESSION;

  if (!sessionCookie) {
    throw new Error("LEETCODE_SESSION is missing in .env file");
  }

  const response = await axios.get(
    "https://leetcode.com/api/submissions/?offset=0&limit=10",
    {
      headers: {
        Cookie: `LEETCODE_SESSION=${sessionCookie}`,
        "User-Agent": "Mozilla/5.0",
      },
    }
  );

  const submissions = response.data.submissions_dump || [];

  const acceptedSubmissions = submissions.filter(
    (submission) => submission.status_display === "Accepted"
  );

  const submissionsWithDifficulty = await Promise.all(
    acceptedSubmissions.map(async (submission) => {
      const difficulty = await fetchDifficulty(submission.title_slug);
      return {
        id: submission.id,
        title: submission.title,
        title_slug: submission.title_slug,
        lang: submission.lang,
        difficulty,
        url: submission.url,
      };
    })
  );

  return submissionsWithDifficulty;
}

async function fetchDifficulty(titleSlug) {
  const query = `
    query getProblemDetails($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables: { titleSlug } },
      {
        headers: {
          Cookie: `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    return response.data.data.question.difficulty;
  } catch (error) {
    console.error(`Error fetching difficulty for ${titleSlug}:`, error.message);
    return "Unknown";
  }
}

async function main() {
  try {
    const stats = await fetchProfileStats();
    const submissions = await fetchSubmissions();

    generateReadme(stats, submissions);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();

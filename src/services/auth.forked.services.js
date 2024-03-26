import axios from "axios";
import {
  CHANGELOG_PR_BRIDGE_API_BASE_URL,
} from "../config/constants.js";

import {
  handleChangelogPRBridgeResponseErrors,
} from "../utils/index.js";
/**
 * Get the github app installation info from the forked repo
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @returns {Promise<object>} - An object containing the app info.
 * @throws {Error} - If an error occurs while fetching the file.
 */
const getGitHubAppInstallationInfoFromForkedRepo = async (owner, repo) => {
  try {
    const { data } = await axios.get(
      `${CHANGELOG_PR_BRIDGE_API_BASE_URL}/auth/github-app-information`,
      {
        params: {
          owner: owner,
          repo: repo,
        },
      }
    );

    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error fetching GitHub App installation info from forked repo ${owner}/${repo}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "READ", path);
  }
};

export const forkedAuthServices = {
  getGitHubAppInstallationInfoFromForkedRepo,
};

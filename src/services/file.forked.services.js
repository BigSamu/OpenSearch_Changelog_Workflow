import axios from "axios";
import {
  CHANGELOG_PR_BRIDGE_API_BASE_URL,
  CHANGELOG_PR_BRIDGE_API_KEY,
} from "../config/constants.js";

import {
  checkChangelogPrBridgeUrlDomainIsConfigured,
  checkChangelogPrBridgeApiKeyIsConfigured,
  handleChangelogPRBridgeResponseErrors,
} from "../utils/index.js";
/**
 * Get a file in a given path in a forked GitHub repository.
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} path - The file path.
 * @returns {Promise<object>} - An object containing the file details.
 * @throws {Error} - If an error occurs while fetching the file.
 */
const getFileFromForkedRepoByPath = async (owner, repo, branch, path) => {
  checkChangelogPrBridgeUrlDomainIsConfigured();
  checkChangelogPrBridgeApiKeyIsConfigured();
  try {
    const { data } = await axios.get(
      `${CHANGELOG_PR_BRIDGE_API_BASE_URL}/files`,
      {
        headers: {
          "X-API-Key": CHANGELOG_PR_BRIDGE_API_KEY,
        },
        params: {
          owner: owner,
          repo: repo,
          branch: branch,
          path: path,
        },
      }
    );

    return {
      name: data.name,
      path: data.path,
      download_url: data.download_url,
      content: data.content,
      sha: data.sha,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error fetching file from forked repo ${owner}/${branch}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "READ", path);
  }
};

/**
 * Gets all files in a given directory in a forked GitHub repository.
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} directoryPath - The directory path.
 * @returns {Promise<object[]>} - An array of objects containing the file details.
 * @throws {Error} - If an error occurs while fetching the directory files.
 *
 */

const getAllFilesFromForkedRepoByPath = async (
  owner,
  repo,
  branch,
  directoryPath
) => {
  checkChangelogPrBridgeUrlDomainIsConfigured();
  checkChangelogPrBridgeApiKeyIsConfigured();
  try {
    const { data } = await axios.get(
      `${CHANGELOG_PR_BRIDGE_API_BASE_URL}/directory/files`,
      {
        headers: {
          "X-API-Key": CHANGELOG_PR_BRIDGE_API_KEY,
        },
        params: {
          owner: owner,
          repo: repo,
          branch: branch,
          path: directoryPath,
        },
      }
    );
    return data?.files || [];
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error fetching file from forked repo ${owner}/${branch}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "READ", directoryPath);
  }
};

/**
 * Creates or updates a new file in a forked repository.
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} path - The file path.
 * @param {string} content - The file content.
 * @returns {Promise<object>} - An object containing the created or updated file details.
 * @throws {Error} - If an error occurs while creating or updating the file.
 */
const createOrUpdateFileInForkedRepoByPath = async (
  owner,
  repo,
  branch,
  path,
  content,
  message
) => {
  checkChangelogPrBridgeUrlDomainIsConfigured();
  checkChangelogPrBridgeApiKeyIsConfigured();
  try {
    const encodedContent = Buffer.from(content).toString("base64");
    await axios.post(
      `${CHANGELOG_PR_BRIDGE_API_BASE_URL}/files`,
      { content: encodedContent, message: message },
      {
        headers: {
          "X-API-Key": CHANGELOG_PR_BRIDGE_API_KEY,
        },
        params: {
          owner: owner,
          repo: repo,
          branch: branch,
          path: path,
        },
      }
    );
    // Log the commit message for the created or updated file in a forked repo
    console.log(message);
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error creating/updating file in forked repo ${owner}/${branch}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "CREATE_OR_UPDATE", path);
  }
};

/**
 * Deletes a file from a forked GitHub repository.
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} path - The file path.
 * @returns {Promise<void>} A Promise that resolves when the file is deleted.
 * @throws {Error} - If an error occurs while deleting the file.
 */
const deleteFileInForkedRepoByPath = async (
  owner,
  repo,
  branch,
  path,
  message
) => {
  checkChangelogPrBridgeUrlDomainIsConfigured();
  checkChangelogPrBridgeApiKeyIsConfigured();
  try {
    await axios.delete(`${CHANGELOG_PR_BRIDGE_API_BASE_URL}/files`, {
      headers: {
        "X-API-Key": CHANGELOG_PR_BRIDGE_API_KEY,
      },
      data: { message: message },
      params: {
        owner: owner,
        repo: repo,
        branch: branch,
        path: path,
      },
    });
    // Log the commit message for the deleted file in forked repo
    console.log(message);
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error deleting file from forked repo ${owner}/${branch}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "DELETE", path);
  }
};

/**
 * Deletes all files in a given directory in a forked GitHub repository.
 *
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name.
 * @param {string} directoryPath - The directory path.
 * @returns {Promise<void>} A Promise that resolves when all files are deleted.
 * @throws {Error} - If an error occurs while deleting all files.
 */
async function deleteAllFilesByPath(owner, repo, branch, directoryPath) {
  checkChangelogPrBridgeUrlDomainIsConfigured();
  checkChangelogPrBridgeApiKeyIsConfigured();
  try {
    const { data } = await axios.delete(
      `${CHANGELOG_PR_BRIDGE_API_BASE_URL}/directory/files`,
      {
        headers: {
          "X-API-Key": CHANGELOG_PR_BRIDGE_API_KEY,
        },
        data: { message: message },
        params: {
          owner: owner,
          repo: repo,
          branch: branch,
          path: directoryPath,
        },
      }
    );
    // Log the commit message for the deleted file in forked repo
    console.log(data.commitMessage);
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(
      `Error deleting file from forked repo ${owner}/${branch}:`,
      errorMessage
    );
    handleChangelogPRBridgeResponseErrors(error, "DELETE", directoryPath);
  }
}

export const forkedFileServices = {
  getFileFromForkedRepoByPath,
  getAllFilesFromForkedRepoByPath,
  createOrUpdateFileInForkedRepoByPath,
  deleteFileInForkedRepoByPath,
  deleteAllFilesByPath,
};

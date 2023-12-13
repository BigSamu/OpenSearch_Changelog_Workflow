import github from "@actions/github";
import {
  PullRequestDataExtractionError,
  GetGithubContentError,
  CreateChangesetFileError,
  UpdateChangesetFileError,
  CategoryWithSkipOptionError,
  UpdatePRLabelError,
} from "./customErrors.js";
import { SKIP_LABEL } from "../config/constants.js";

/**
 * Extracts relevant data from a GitHub Pull Request using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @returns {Promise<Object>} Promise resolving to object containing pull request details.
 * @throws {PullRequestDataExtractionError} If data extraction fails.
 */
export const extractPullRequestData = async (octokit) => {
  try {
    // Retrieve context data from the GitHub action environment
    const context = github.context;
    const { owner, repo } = context.repo;
    const prNumber = context.payload.pull_request.number;

    console.log(`Extracting data for PR #${prNumber} in ${owner}/${repo}`);

    // Fetch pull request details using Octokit
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Validate response
    if (!pullRequest || typeof pullRequest !== "object") {
      throw new PullRequestDataExtractionError();
    }

    // Destructure necessary fields and validate them
    const { body, html_url } = pullRequest;
    if (body === undefined || html_url === undefined) {
      throw new PullRequestDataExtractionError();
    }

    // Return relevant PR data
    return {
      owner,
      repo,
      prNumber,
      prDescription: pullRequest.body,
      prLink: pullRequest.html_url,
      branchRef: context.payload.pull_request.head.ref,
    };
  } catch (error) {
    console.error(`Error extracting data from pull request: ${error.message}`);
    // Throw a custom error for issues during data extraction
    throw new PullRequestDataExtractionError();
  }
};

/**
 * Adds or removes a label from a GitHub pull request using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {string} label - Label to be added or removed.
 * @param {boolean} addLabel - Flag to add or remove the label.
 * @throws {UpdatePRLabelError} If unable to add or remove label.
 */
export const updatePRLabel = async (
  octokit,
  owner,
  repo,
  prNumber,
  label,
  addLabel
) => {
  try {
    // Get the current labels on the pull request
    const { data: currentLabels } = await octokit.rest.issues.listLabelsOnIssue(
      {
        owner,
        repo,
        issue_number: prNumber,
      }
    );

    // Check to see if the label is already on the pull request
    const labelExists = currentLabels.some((element) => element.name === label.toLowerCase());

    if (addLabel && !labelExists) {
      // Add the label to the pull request
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: [label],
      });
      console.log(`Label "${label}" added to PR #${prNumber}`);
    } else if (!addLabel && labelExists) {
      // Remove the label from the pull request
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: prNumber,
        name: label,
      });
      console.log(`Label "${label}" removed from PR #${prNumber}`);
    } else {
      console.log(
        `Label "${label}" is already ${
          addLabel ? "present" : "absent"
        } on PR #${prNumber}. No action taken.`
      );
    }
  } catch (error) {
    console.error(
      `Error updating label "${label}" for PR #${prNumber}: ${error.message}`
    );
    throw new UpdatePRLabelError();
  }
};

/**
 * Handles a changeset entry map that contains the "skip" option.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {Object} entryMap - Map of changeset entries.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {Function} updateLabel - Function to add or remove a label from a PR.
 * @throws {CategoryWithSkipOptionError} If 'skip' and other entries are present.
 */
export const handleSkipOption = async (
  octokit,
  entryMap,
  owner,
  repo,
  prNumber,
  updateLabel
) => {
  if (entryMap && Object.keys(entryMap).includes("skip")) {
    // Check if "skip" is the only prefix in the changeset entries
    if (Object.keys(entryMap).length > 1) {
      throw new CategoryWithSkipOptionError();
    } else {
      console.log("No changeset file created or updated.");
      // Adds  "skip-changelog" label in PR if not present
      await updateLabel(octokit, owner, repo, prNumber, SKIP_LABEL, true);
      // Indicates to index.js that the program should exit without creating or updating the changeset file
      return true;
    }
  }
  // Removes "skip-changelog" label in PR if present
  await updateLabel(octokit, owner, repo, prNumber, SKIP_LABEL, false);
  // Indicates to index.js that the program should proceed with creating or updating the changeset file
  return false;
};

/**
 * Generates a comment string for a given error object based on its properties.
 *
 * @param {Error} errorInput - Error object that determines the comment to be posted.
 * @returns {string|null} - A formatted comment string if the error type merits a comment in the PR; otherwise, null.
 *
 */
export const getErrorComment = (errorInput) => {
  if (errorInput.shouldResultInPRComment) {
    return `${errorInput.name}: ${errorInput.message}`;
  }
  return null;
};

/**
 * Posts a comment to a GitHub pull request based on the error type using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {number} prNumber - Pull request number.
 * @param {Error} errorInput - Error object that determines the comment to be posted.
 * @param {Function} getErrorComment - Function that generates a comment string for a given error object based on its properties.
 */
export const postPRComment = async (
  octokit,
  owner,
  repo,
  prNumber,
  errorInput,
  getErrorComment
) => {
  const comment = getErrorComment(errorInput);

  if (comment) {
    try {
      // Post a comment to the pull request
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });
      console.log(`Comment posted to PR #${prNumber}: "${comment}"`);
    } catch (error) {
      console.error(
        `Error posting comment to PR #${prNumber}: ${error.message}`
      );
    }
  } else {
    console.log(
      `No comment posted to PR #${prNumber} due to error type: ${errorInput.name}`
    );
  }
};

/**
 * Creates or updates a file in a GitHub repository using Octokit instance.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance initialized with a GitHub token.
 * @param {string} owner - Owner of the repository.
 * @param {string} repo - Repository name.
 * @param {string} path - File path within the repository.
 * @param {string} content - Base64 encoded content to be written to the file.
 * @param {string} message - Commit message.
 * @param {string} branchRef - Branch reference for the commit.
 * @throws {ChangesetFileAccessError} If access to the file fails.
 */
export const createOrUpdateFile = async (
  octokit,
  owner,
  repo,
  path,
  content,
  message,
  branchRef
) => {
  // File's SHA to check if file exists
  let sha;
  // Attempt to retrieve the file's SHA to check if it exists
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branchRef,
    });
    sha = response.data.sha;
  } catch (error) {
    if (error.status === 404) {
      console.log("Changeset file not found. Proceeding to create a new one.");
    } else {
      throw new GetGithubContentError();
    }
  }

  // Create or update the changeset file content
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
      sha, // If file exists, sha is used to update; otherwise, file is created
      branch: branchRef,
    });
    console.log(`File: ${path} ${sha ? "updated" : "created"} successfully.`);
  } catch (error) {
    if (!sha) {
      throw new CreateChangesetFileError();
    } else {
      throw new UpdateChangesetFileError();
    }
  }
};

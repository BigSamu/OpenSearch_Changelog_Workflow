import {
  GITHUB_APP_NAME,
  GITHUB_APP_INSTALLATION_LINK,
  AUTO_CHANGESET_AND_RELEASE_NOTES_TOOL_NAME,
  AUTO_CHANGESET_AND_RELEASE_NOTES_TOOL_DOCS,
} from "../config/constants.js";

/**
 * Represents an error when the GitHub App is suspended or not installed in the repository.
 */
export class ManualChangesetCreationReminderInfo {
  /**
   * Constructs the GitHubAppSuspendedOrNotInstalledError instance.
   * @param {string} prNumber - The pull request number.
   */

  constructor(prNumber) {
    const message =
      `Please ensure **manual commit for changeset file _${prNumber}.yml_** under folder _changelogs/fragments_ to complete this PR.` +
      `\n\n` +
      `If you want to use the available ${GITHUB_APP_NAME} to avoid manual creation of changeset file you can install it in your forked repository following this [link](${GITHUB_APP_INSTALLATION_LINK}). ` +
      `\n\n` +
      `For more information about formatting of changeset files, please visit [${AUTO_CHANGESET_AND_RELEASE_NOTES_TOOL_NAME}](${AUTO_CHANGESET_AND_RELEASE_NOTES_TOOL_DOCS}).`;
      
    this.name = this.constructor.name;
    this.message = message;
    this.shouldResultInPRComment = true;
  }
}

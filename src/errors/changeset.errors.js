/**
 * Represents an error for a missing changset file that requires to be commited in the PR.
 */
export class ChangesetFileNotAddedYetError extends Error {
  /**
   * Constructs the ChangesetFileNotAddedYetError instance.
   * @param {prNumber} prNumber - The pull request number.
   */
  constructor(prNumber){
    const message = `Please ensure **manual commit for changeset file _${prNumber}.yml_** under folder _changelogs/fragments_ to complete this PR. File still missing.`;

    super(message);
    this.name = this.constructor.name;
    this.shouldResultInPRComment = true;
  }
}

export class ChangesetFileMustNotExistWithSkipEntryOption extends Error {
  /**
   * Constructs the ChangesetFileMustNotExistWithSkipEntryOption instance.
   * @param {prNumber} prNumber - The pull request number.
   */
  constructor(prNumber){
    const message = `Changeset file _${prNumber}.yml_ under folder _changelogs/fragments_ must not exist if the changelog section in PR description includes a "skip" entry option. Please remove the file and try again.`;

    super(message);
    this.name = this.constructor.name;
    this.shouldResultInPRComment = true;
  }
}

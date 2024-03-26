/**
 * Checks if a specific file is part of the changes in a pull request.
 *
 * @param {InstanceType<typeof GitHub>} octokit - An Octokit instance.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} prNumber - The pull request number.
 * @param {string} path - The file path.
 * @returns {Promise<object>} - An object containing the file details.
 * @throws {Error} - If an error occurs while fetching the file.
 */
const isFileInCommitedChanges = async (
  octokit,
  owner,
  repo,
  prNumber,
  path
) => {
  try {
    let page = 1;
    let files;
    do {
      // Get the list of files for the pull request for the current page
      ({ data: files } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        page,
      }));
      // Increment page for next iteration
      page++;
      // Check if the specified file is in the list
      if (files.some((file) => file.filename === path)) {
        console.log(`File '${path}' found in pull request #${prNumber}`);
        return true; // File found, no need to check further
      }
    } while (files.length !== 0); // Continue if the current page was not empty

    console.log(`File '${path}' not found in pull request #${prNumber}`);
    return false; // File not found in any pages
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Rethrow the error for further handling if necessary
  }
};

export const pullRequestServices = {
  isFileInCommitedChanges,
};

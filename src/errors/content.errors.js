/**
 * Represents an error during the retrieval of content from a GitHub repository.
 */
export class GetContentError extends Error {
  /**
   * Constructs the GetContentError instance.
   */
  constructor() {
    const message =
      "Something went wrong. Error retrieving content from repository. Please try again.";
    super(message);
    this.name = this.constructor.name;
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error during the creation of content in a GitHub repository.
 */
export class CreateOrUpdateContentError extends Error {
  /**
   * Constructs the CreateContentError instance.
   */
  constructor() {
    const message =
      "Something went wrong. Error creating or updating content in repository. Please try again.";
    super(message);
    this.name = this.constructor.name;
    this.shouldResultInPRComment = true;
  }
}

/**
 * Represents an error during the deletion of content in a GitHub repository.
 */
export class DeleteContentError extends Error {
  /**
   * Constructs the DeleteContentError instance.
   */
  constructor() {
    const message =
      "Something went wrong. Error deleting content in repository. Please try again.";
    super(message);
    this.name = this.constructor.name;
    this.shouldResultInPRComment = true;
  }
}

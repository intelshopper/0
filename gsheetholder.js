// Google Apps Script for Mystery Shopper Form Submissions
const sheetName = "Sheet1";
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty("key", activeSpreadsheet.getId());

  // Set up headers if this is a new sheet
  const doc = SpreadsheetApp.openById(scriptProp.getProperty("key"));
  const sheet = doc.getSheetByName(sheetName);

  // Check if headers exist, if not create them
  if (sheet.getLastRow() === 0) {
    const headers = [
      "timestamp",
      "fullname",
      "address",
      "city",
      "email",
      "phone",
      "terms",
      "newsletter",
      "source",
      "formattedAddress",
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty("key"));
    const sheet = doc.getSheetByName(sheetName);

    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Create formatted address field for better readability
    const fullname = data.fullname || "";
    const address = data.address || "";
    const city = data.city || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const terms = data.terms || "";
    const newsletter = data.newsletter || "";
    const source = data.source || "";

    const formattedAddress = `${fullname}\n${address}\n${city}\n${email}\n${phone}\n================`;

    // Prepare the new row data
    const newRow = [
      new Date(),
      fullname,
      address,
      city,
      email,
      phone,
      terms,
      newsletter,
      source,
      formattedAddress,
    ];

    // Append the new row
    sheet.appendRow(newRow);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        row: sheet.getLastRow(),
        message: "Application submitted successfully!",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);

    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        error: error.toString(),
        message:
          "There was an error submitting your application. Please try again.",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Test function to verify the script is working
function testDoPost() {
  const testData = {
    fullname: "John Doe",
    address: "123 Main St",
    city: "New York, NY 10001",
    email: "john@example.com",
    phone: "555-123-4567",
    terms: "Yes",
    newsletter: "No",
    source: "Website Application Form",
    timestamp: new Date().toISOString(),
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  };

  const result = doPost(mockEvent);
  console.log(result.getContent());
}

// Function to delete a quote
async function deleteQuote(id) {
    // Prompt the admin for a password
    const password = prompt("Enter admin password:");
    if (!password) return; // Exit if no password is entered

    try {
        // Send a POST request to the server to delete the quote
        const response = await fetch('/delete-quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, password })
        });

        // Check if the response is successful
        if (response.ok) {
            alert("Quote deleted successfully");
            location.reload(); // Reload the page to update the quote list
        } else {
            // Display the error message from the server
            const errorMessage = await response.text();
            alert(`Failed to delete quote: ${errorMessage}`);
        }
    } catch (error) {
        // Log any errors and show an alert
        console.error("Error:", error);
        alert("An error occurred while deleting the quote");
    }
}

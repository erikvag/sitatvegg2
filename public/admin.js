// Function to delete a quote
async function deleteQuote(id) {
    const confirmation = confirm("Are you sure you want to delete this quote?");
    if (!confirmation) return;

    try {
        const response = await fetch('/delete-quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            alert("Quote deleted successfully");
            location.reload();
        } else {
            const errorMessage = await response.text();
            alert(`Failed to delete quote: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the quote");
    }
}

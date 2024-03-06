document.addEventListener("DOMContentLoaded", function () {
  loadProductsFromLocalStorage();
  fetch("https://ggrant111.github.io/elead/data.json")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("product-container");
      data.forEach((categoryObject) => {
        for (const category in categoryObject) {
          const section = document.createElement("section");
          section.className = "section";
          section.innerHTML = `
              <div class="section-header">${category}</div>
              <div class="section-content"></div>
            `;
          const sectionContent = section.querySelector(".section-content");

          categoryObject[category].forEach((product) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${product["CDK DESCRIPTION"]}</h3>
                <p>Recurring: $${product.Recurring}</p>
                <p>Upfront: $${product["One-Time"]}</p>
                <button onclick='addToProposal(\`${JSON.stringify(
                  product
                )}\`)'>+</button>


              `;
            sectionContent.appendChild(card);
          });

          container.appendChild(section);
        }
      });
    })
    .catch((error) => console.error("Error:", error));
});

function addToProposal(productString) {
  let product = JSON.parse(productString);
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  proposal.push(product);
  localStorage.setItem("proposal", JSON.stringify(proposal));
  console.log(`Added ${product["CDK DESCRIPTION"]} to proposal`);
  updateSidebar(product);
  updateTotals();
}

// Example function to display the proposal in a modal
function displayProposal() {
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  let tableContent = proposal
    .map(
      (product) =>
        `<tr>
            <td>${product["CDK CATALOG"]}</td>
            <td>${product["CDK DESCRIPTION"]}</td>
            <td>${product["Recurring"]}</td>
            <td>${product["One-Time"]}</td>
         </tr>`
    )
    .join("");

  let modal = document.getElementById("proposalModal");
  let tbody = modal.querySelector("table tbody"); // Correctly target the tbody
  tbody.innerHTML = tableContent;
  modal.style.display = "block"; // Show the modal
}

// Example function to view the proposal
function viewProposal() {
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  console.log("Current proposal:", proposal);
}

function clearProposal() {
  localStorage.removeItem("proposal");
  console.log("Proposal cleared from local storage");
}

document
  .getElementById("clearProposalButton")
  .addEventListener("click", clearProposal);
document
  .getElementById("clearProposalButton")
  .addEventListener("click", removeFromProposal);

function generateProposal() {
  let companyName = prompt(
    "Please enter the name of the company for this proposal:"
  );
  if (companyName) {
    let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
    let proposalKey = `proposal-${companyName}-${new Date().getTime()}`;
    let proposalData = {
      companyName: companyName,
      items: proposal,
    };
    localStorage.setItem(proposalKey, JSON.stringify(proposalData));
    console.log(`Proposal for ${companyName} saved.`);
  } else {
    console.log("Proposal generation cancelled.");
  }
  clearProposal();
  removeFromProposal();
}

function closeModal() {
  let modal = document.getElementById("proposalModal");
  modal.style.display = "none";
}

function updateSidebar(product, index) {
  let sidebar = document.getElementById("productList");
  let productElement = document.createElement("div");
  productElement.className = "card";
  productElement.innerHTML = `
      <p>${product["CDK DESCRIPTION"]}</p>
      <p>Recurring: $${product.Recurring}</p>
      <p>Upfront: $${product["One-Time"]}</p>
      <button onclick="removeFromProposal(${index})">X</button>
    `;
  sidebar.appendChild(productElement);
}

function removeFromProposal(index) {
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  proposal.splice(index, 1); // Remove the product at the given index
  localStorage.setItem("proposal", JSON.stringify(proposal));

  // Update the sidebar to reflect the removal
  let sidebar = document.getElementById("productList");
  sidebar.innerHTML = ""; // Clear the sidebar
  proposal.forEach((product, idx) => updateSidebar(product, idx)); // Re-add remaining products
  updateTotals();
}

function updateTotals() {
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  let totalRecurring = proposal.reduce((acc, product) => {
    let recurring = parseFloat(product.Recurring.replace(/,/g, ""));
    return acc + (isNaN(recurring) ? 0 : recurring);
  }, 0);

  let totalOneTime = proposal.reduce((acc, product) => {
    let oneTime = parseFloat(product["One-Time"].replace(/,/g, ""));
    return acc + (isNaN(oneTime) ? 0 : oneTime);
  }, 0);

  document.getElementById(
    "totalRecurring"
  ).textContent = `Total Recurring: $${totalRecurring.toFixed(2)}`;
  document.getElementById(
    "totalOneTime"
  ).textContent = `Total One-Time: $${totalOneTime.toFixed(2)}`;
}

function loadProductsFromLocalStorage() {
  let proposal = JSON.parse(localStorage.getItem("proposal")) || [];
  proposal.forEach((product, index) => {
    updateSidebar(product, index);
  });
  updateTotals(); // Update the totals based on loaded products
}

function toggleSidebar() {
  let sidebar = document.getElementById("sidebar");
  let mainContent = document.getElementById("product-container");

  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
    mainContent.style.marginRight = "300px"; // Adjust to sidebar's width
  } else {
    sidebar.style.display = "none";
    mainContent.style.marginRight = "0"; // Main content takes full width
  }
}

function viewHistory() {
  const allKeys = Object.keys(localStorage);
  const proposalKeys = allKeys.filter((key) => key.startsWith("proposal-"));

  let historyContent = proposalKeys
    .map((key) => {
      let timestamp = key.split("-").pop(); // Extract timestamp
      let proposalDateTime = new Date(parseInt(timestamp));
      let formattedDate = proposalDateTime.toLocaleDateString(); // Date in user-friendly format
      let formattedTime = proposalDateTime.toLocaleTimeString(); // Time in user-friendly format
      let proposal = JSON.parse(localStorage.getItem(key));
      return `<div class="card" onclick="loadProposalDetails('${key}')">
                <p>${proposal.companyName}</p>
                <p>Created on: ${formattedDate} at ${formattedTime}</p>
              </div>`;
    })
    .join("");

  // Assuming you have a modal with an element for content (e.g., a div with id 'historyContent')
  document.getElementById("historyContent").innerHTML = historyContent;
  // Code to show the modal (e.g., setting its display style to 'block')
  document.getElementById("historyModal").style.display = "block";
}
function updateSidebarTotals() {
  let products = document.querySelectorAll("#productList .card");
  let totalRecurring = 0,
    totalOneTime = 0;

  products.forEach((product) => {
    let recurring = parseFloat(product.getAttribute("data-recurring")) || 0;
    let oneTime = parseFloat(product.getAttribute("data-one-time")) || 0;
    totalRecurring += recurring;
    totalOneTime += oneTime;
  });

  document.getElementById(
    "totalRecurring"
  ).textContent = `Total Recurring: $${totalRecurring}`;
  document.getElementById(
    "totalOneTime"
  ).textContent = `Total One-Time: $${totalOneTime}`;
}

function loadProposalDetails(key) {
  let proposal = JSON.parse(localStorage.getItem(key));
  let productList = document.getElementById("productList");
  productList.innerHTML = ""; // Clear current products

  proposal.items.forEach((product, index) => {
    let productElement = document.createElement("div");
    productElement.className = "card";
    productElement.setAttribute(
      "data-recurring",
      product.Recurring.replace(/,/g, "")
    );
    productElement.setAttribute(
      "data-one-time",
      product["One-Time"].replace(/,/g, "")
    );
    productElement.innerHTML = `
        <p>${product["CDK DESCRIPTION"]}</p>
        <p>Recurring: $${product.Recurring}</p>
        <p>Upfront: $${product["One-Time"]}</p>
        <button onclick="removeProductFromProposal('${key}', ${index})">X</button>
      `;
    productList.appendChild(productElement);
  });

  updateSidebarTotals();
}

function removeProductFromProposal(key, index) {
  let proposal = JSON.parse(localStorage.getItem(key));
  proposal.items.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(proposal));
  loadProposalDetails(key); // Refresh the sidebar
}

// Attaching the event listener to the close button
document.querySelector(".modal .close").addEventListener("click", closeModal);
function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
}

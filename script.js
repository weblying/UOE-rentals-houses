// Default listings

    
   

// Global variables
let currentRegion = "all";
let currentPrice = "all";
let currentType = "all";
let searchTerm = "";
let currentSort = "default";

// Load from localStorage if available
function loadData() {
    const saved = localStorage.getItem('uoe_rentals_listings');
    if (saved && JSON.parse(saved).length > 0) {
        listings = JSON.parse(saved);
    }
    updateStats();
}

function updateStats() {
    const totalVacant = listings.reduce((sum, l) => sum + l.vacant, 0);
    const verifiedCount = listings.filter(l => l.verified).length;
    document.getElementById('statTotal').innerText = totalVacant;
    document.getElementById('statVerified').innerText = verifiedCount;
}

function displayListings() {
    let filteredRooms = listings.filter(room => {
        if (currentRegion !== "all" && room.region !== currentRegion) return false;
        if (currentType !== "all" && room.type !== currentType) return false;
        
        if (currentPrice !== "all") {
            if (currentPrice === "below3500" && room.price >= 3500) return false;
            if (currentPrice === "3500-4500" && (room.price < 3500 || room.price > 4500)) return false;
            if (currentPrice === "4500-5500" && (room.price < 4500 || room.price > 5500)) return false;
            if (currentPrice === "above5500" && room.price <= 5500) return false;
        }
        
        if (searchTerm && !room.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !room.region.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !room.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
    });
    
    if (currentSort === "price-low") {
        filteredRooms.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
        filteredRooms.sort((a, b) => b.price - a.price);
    } else if (currentSort === "vacancy") {
        filteredRooms.sort((a, b) => b.vacant - a.vacant);
    }
    
    const resultsCountEl = document.getElementById("resultsCount");
    resultsCountEl.textContent = `${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''} available`;
    
    const container = document.getElementById("listingsContainer");
    
    if (filteredRooms.length === 0) {
        container.innerHTML = `<div class="no-results"><i class="fas fa-home" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem; display: block;"></i><h3>No rooms found</h3><p>Try adjusting your filters or search term</p></div>`;
        return;
    }
    
    container.innerHTML = filteredRooms.map(room => {
        const vacancyClass = room.vacant === 0 ? 'full' : (room.vacant <= 2 ? 'limited' : 'available');
        const vacancyText = room.vacant === 0 ? 'FULL' : (room.vacant <= 2 ? `${room.vacant} left` : `${room.vacant} available`);
        const imageSrc = room.image && room.image !== "" ? room.image : "";
        
        return `
            <div class="room-card">
                <div class="room-image-container">
                    <img class="room-image" src="${imageSrc}" alt="${room.name}" onerror="this.style.display='none'; this.parentElement.style.background='#e5e7eb'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.innerHTML='<i class=\'fas fa-image\' style=\'font-size: 3rem; color: #9ca3af;\'></i>'">
                    ${room.verified ? '<div class="room-badge verified"><i class="fas fa-check-circle"></i> Verified</div>' : ''}
                    ${room.popular ? '<div class="room-badge popular"><i class="fas fa-fire"></i> Popular</div>' : ''}
                    <div class="vacancy-badge ${vacancyClass}">${room.vacant === 0 ? '<i class="fas fa-times-circle"></i>' : '<i class="fas fa-door-open"></i>'} ${vacancyText}</div>
                </div>
                <div class="room-info">
                    <div class="room-header">
                        <h3 class="room-name">${room.name}</h3>
                        <div class="room-price">Ksh ${room.price.toLocaleString()}<small>/mo</small></div>
                    </div>
                    <div class="room-details">
                        <span><i class="fas fa-map-marker-alt"></i> ${room.region}</span>
                        <span><i class="fas fa-walking"></i> ${room.walkTime}</span>
                        <span><i class="fas fa-bed"></i> ${room.type}</span>
                    </div>
                    <div class="features">${room.features.map(f => `<span class="feature"><i class="fas fa-check"></i> ${f}</span>`).join('')}</div>
                    <div class="contact-buttons">
                        <a href="tel:${room.phone}" class="btn-call"><i class="fas fa-phone"></i> Call</a>
                        <a href="https://wa.me/${room.whatsapp}?text=Hi%2C%20I%20saw%20your%20${encodeURIComponent(room.name)}%20on%20UoE%20Rentals%20and%20I'm%20interested" class="btn-whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    </div>
                    <div class="landlord-info">
                        <span><i class="fas fa-user"></i> ${room.landlord}</span>
                        <span><i class="fas fa-road"></i> ${room.distance}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilters() {
    document.querySelectorAll('#regionFilters .tag').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#regionFilters .tag').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRegion = btn.dataset.region;
            displayListings();
        });
    });
    
    document.querySelectorAll('#priceFilters .tag').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#priceFilters .tag').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPrice = btn.dataset.price;
            displayListings();
        });
    });
    
    document.querySelectorAll('#typeFilters .tag').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#typeFilters .tag').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            displayListings();
        });
    });
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        displayListings();
    });
    
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayListings();
    });
    
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    filterToggle.addEventListener('click', () => {
        filterPanel.classList.toggle('open');
        const icon = filterToggle.querySelector('i');
        if (filterPanel.classList.contains('open')) {
            icon.classList.remove('fa-sliders-h');
            icon.classList.add('fa-chevron-up');
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-sliders-h');
        }
    });
}

function setupModal() {
    const modal = document.getElementById('listingModal');
    const listBtn = document.getElementById('listHostelBtn');
    const ctaBtn = document.getElementById('ctaListBtn');
    const closeBtn = document.querySelector('.modal-close');
    
    listBtn.onclick = () => modal.style.display = 'block';
    ctaBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
}

function init() {
    loadData();
    setupFilters();
    setupModal();
    displayListings();
}

init();

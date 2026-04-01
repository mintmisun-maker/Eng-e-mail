const templatesData = [
    {
        id: 'ack_receipt',
        title: 'Acknowledging Receipt & Under Review',
        desc: '서신 접수 및 검토 안내',
        template: "The Korea Fair Trade Commission (KFTC) presents its compliments to the [Foreign Authority] and has the honor to acknowledge receipt of your correspondence dated [Date] regarding [Subject or Case Name].\n\nPlease be advised that the International Cooperation Division is currently reviewing the matter in close consultation with the relevant investigative bureaus. We will revert to you with a substantive response in due course."
    },
    {
        id: 'provide_info',
        title: 'Providing Information/Data',
        desc: '정보/자료 제공 동의 및 기밀 유지 당부',
        template: "In the spirit of international comity and bilateral enforcement cooperation, the KFTC is pleased to furnish the enclosed information pertinent to [Case or Subject].\n\nPlease note that these materials are provided strictly for law enforcement purposes. We kindly request that the [Foreign Authority] accords the utmost confidentiality to this information and refrains from disclosing it to any third party without explicit prior written consent from the KFTC, in accordance with applicable laws and established confidentiality frameworks."
    },
    {
        id: 'decline_info',
        title: 'Declining Requests (Confidentiality)',
        desc: '정보 제공 거절 및 양해 구하기',
        template: "While the KFTC remains highly committed to fostering robust cross-border cooperation, we regret to inform you that we are presently unable to disclose the requested specific case files regarding [Case or Subject].\n\nPursuant to the strictly enforced confidentiality protocols under the Monopoly Regulation and Fair Trade Act (MRFTA), detailed particulars of an ongoing investigation cannot be shared prior to a finalized Commission deliberation and decision.\n\nWe deeply appreciate your profound understanding of our statutory limitations and look forward to continuing our mutually beneficial cooperative relationship on other enforcement fronts."
    },
    {
        id: 'request_info',
        title: 'Requesting Information',
        desc: '공정위 측의 협조 요청',
        template: "The KFTC is presently conducting an inquiry into [Sector or Case Description].\n\nRecognizing our parallel interests and the mutual benefits derived from cooperative enforcement, we respectfully request any non-confidential information or insights your esteemed agency may be reasonably able to share regarding analogous conduct within your jurisdiction. \n\nAny assistance rendered would be highly valued, subject to reciprocal cooperation, and treated with strict confidentiality."
    },
    {
        id: 'propose_meeting',
        title: 'Proposing/Confirming Meetings',
        desc: '양자 회의 제안 및 일정 조율',
        template: "To further deliberate on issues regarding [Subject of Meeting] and exchange views on prospective collaborative efforts, the KFTC proposes convening a bilateral video conference at your earliest convenience.\n\nWe have attached a preliminary agenda for your review and perusal. We would be immensely grateful if you could indicate your availability during the week of [Proposed Date]."
    }
];

let currentTemplate = null;
let currentInputs = {};

// DOM Element References
const templateListEl = document.getElementById('template-list');
const titleEl = document.getElementById('current-template-title');
const descEl = document.getElementById('current-template-desc');
const formContainerEl = document.getElementById('variables-form-container');
const previewOutputEl = document.getElementById('preview-output');
const copyBtn = document.getElementById('copy-btn');
const toastEl = document.getElementById('copy-toast');

function init() {
    renderSidebar();
}

// Render Menu Items
function renderSidebar() {
    templatesData.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'template-item';
        li.dataset.id = item.id;
        li.innerHTML = `
            <div class="template-title">${item.title}</div>
            <div class="template-meta">${item.desc}</div>
        `;
        li.addEventListener('click', () => selectTemplate(item, li));
        templateListEl.appendChild(li);
    });
}

// Handle Template Selection
function selectTemplate(item, element) {
    // Update Active Styling
    document.querySelectorAll('.template-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Update Headers
    currentTemplate = item;
    titleEl.textContent = item.title;
    descEl.textContent = item.desc;
    copyBtn.disabled = false;

    // Trigger Re-render
    extractVariablesAndRenderForm(item.template);
    updatePreview();
}

// Parse brackets [ ] and create input fields
function extractVariablesAndRenderForm(templateStr) {
    const regex = /\[(.*?)\]/g;
    let match;
    const variables = new Set();
    
    while ((match = regex.exec(templateStr)) !== null) {
        variables.add(match[1]); // Extract text inside brackets
    }

    currentInputs = {};
    formContainerEl.innerHTML = ''; // Clear container

    // Handle edge case where there are no variables
    if (variables.size === 0) {
        formContainerEl.innerHTML = '<div class="empty-state">No variables to fill in this template.</div>';
        return;
    }

    let delay = 0;
    variables.forEach(variable => {
        currentInputs[variable] = '';

        const groupDiv = document.createElement('div');
        groupDiv.className = 'input-group';
        groupDiv.style.animationDelay = `${delay}s`;
        delay += 0.08;

        const label = document.createElement('label');
        label.textContent = variable;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter ${variable}...`;
        
        // Two-way binding trigger
        input.addEventListener('input', (e) => {
            currentInputs[variable] = e.target.value;
            updatePreview();
        });

        groupDiv.appendChild(label);
        groupDiv.appendChild(input);
        formContainerEl.appendChild(groupDiv);
    });
}

// Map user inputs to the template and render
function updatePreview() {
    if (!currentTemplate) return;

    let resultMsg = currentTemplate.template;
    
    // Replace all dynamic variables globally
    for (const [key, value] of Object.entries(currentInputs)) {
        // Only replace exact matches ignoring regex injection
        const regex = new RegExp(`\\[${escapeRegExp(key)}\\]`, 'g');
        
        // Use placeholder or actual value
        const replacement = value.trim() === '' ? `[${key}]` : value;
        resultMsg = resultMsg.replace(regex, replacement);
    }

    previewOutputEl.textContent = resultMsg;
    
    // Aesthetic check: if it's completely filled, you might add a minor styling here
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Copy Text to Clipboard
copyBtn.addEventListener('click', () => {
    if (!currentTemplate) return;
    
    const textToCopy = previewOutputEl.textContent;
    
    // Modern Clipboard API
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy', err);
        // Fallback for older environments
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast();
    });
});

// Toast Animation
function showToast() {
    toastEl.classList.remove('hidden');
    
    // Force reflow to reset animation
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.classList.add('hidden'), 500); // match CSS transition
    }, 2500);
}

// Boot
init();

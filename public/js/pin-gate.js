// --- PIN Gate for Admin & Expenses Pages ---
// Shows a small PIN prompt overlay. Default PIN: 210921
// Once verified, stores in sessionStorage so it persists for the session.

(function () {
    const CORRECT_PIN = '210921';
    const SESSION_KEY = 'admin_pin_verified';

    // If already verified this session, skip
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return;

    // Hide page content until PIN is entered
    document.body.style.overflow = 'hidden';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'pinOverlay';
    overlay.innerHTML = `
        <div class="pin-backdrop"></div>
        <div class="pin-modal">
            <div class="pin-icon">🔐</div>
            <h2 class="pin-title">Enter PIN</h2>
            <p class="pin-subtitle">This section requires a PIN to access</p>
            <form id="pinForm">
                <div class="pin-input-row">
                    <input type="password" id="pinInput" class="pin-input" maxlength="6" 
                           placeholder="••••••" autofocus inputmode="numeric" pattern="[0-9]*">
                </div>
                <div class="pin-error" id="pinError">Incorrect PIN. Try again.</div>
                <button type="submit" class="pin-submit">Unlock →</button>
            </form>
        </div>
    `;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .pin-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 9998;
            animation: pinFadeIn 0.3s ease;
        }

        .pin-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card, #1a1a2e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: 20px;
            padding: 36px 32px;
            z-index: 9999;
            text-align: center;
            min-width: 300px;
            max-width: 360px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
            animation: pinSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pin-icon {
            font-size: 3rem;
            margin-bottom: 8px;
            animation: pinBounce 2s ease-in-out infinite;
        }

        @keyframes pinBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        .pin-title {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(135deg, #e0e0ff, #c4b5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .pin-subtitle {
            color: var(--text-muted, #888);
            font-size: 0.85rem;
            margin-bottom: 24px;
        }

        .pin-input-row {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
        }

        .pin-input {
            width: 100%;
            padding: 14px 16px;
            font-size: 1.5rem;
            text-align: center;
            letter-spacing: 8px;
            border: 2px solid var(--border, rgba(255, 255, 255, 0.1));
            border-radius: 12px;
            background: var(--bg-base, #12121f);
            color: var(--text-primary, #fff);
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            font-family: inherit;
        }

        .pin-input:focus {
            border-color: var(--lavender-deep, #8b7cf7);
            box-shadow: 0 0 0 3px rgba(139, 124, 247, 0.2);
        }

        .pin-input.shake {
            animation: pinShake 0.4s ease;
            border-color: #e06469;
        }

        .pin-error {
            color: #e06469;
            font-size: 0.82rem;
            margin-bottom: 16px;
            min-height: 20px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .pin-error.visible {
            opacity: 1;
        }

        .pin-submit {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, var(--lavender, #c4b5fd), var(--lavender-deep, #8b7cf7));
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.2s ease;
            font-family: inherit;
        }

        .pin-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(139, 124, 247, 0.3);
        }

        .pin-submit:active {
            transform: translateY(0);
        }

        @keyframes pinFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes pinSlideIn {
            from { opacity: 0; transform: translate(-50%, -48%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }

        @keyframes pinShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }

        @keyframes pinUnlock {
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }

        @keyframes pinBackdropOut {
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Focus input
    setTimeout(() => {
        document.getElementById('pinInput')?.focus();
    }, 100);

    // Handle form submit
    document.getElementById('pinForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('pinInput');
        const error = document.getElementById('pinError');

        if (input.value === CORRECT_PIN) {
            // Success — store and remove overlay
            sessionStorage.setItem(SESSION_KEY, 'true');

            const modal = overlay.querySelector('.pin-modal');
            const backdrop = overlay.querySelector('.pin-backdrop');
            modal.style.animation = 'pinUnlock 0.3s ease forwards';
            backdrop.style.animation = 'pinBackdropOut 0.3s ease forwards';

            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        } else {
            // Wrong PIN
            error.classList.add('visible');
            input.classList.add('shake');
            input.value = '';
            input.focus();
            setTimeout(() => input.classList.remove('shake'), 400);
        }
    });
})();

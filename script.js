
        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize theme
            initTheme();
            
            // Check if user is already logged in
            checkAuthStatus();
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize demo data
            initializeDemoData();
            
            // Initialize password strength checker
            initPasswordStrengthChecker();
        });

        // Function to initialize theme
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
            }
        }

        // Function to toggle theme
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            document.getElementById('themeToggle').innerHTML = isDarkMode 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }

        // Function to check authentication status
        function checkAuthStatus() {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                const user = JSON.parse(loggedInUser);
                showDashboard(user);
                logActivity(user.id, 'login', 'User logged in');
            }
        }

        // Function to set up all event listeners
        function setupEventListeners() {
            // Theme toggle
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            
            // Login/Signup buttons
            document.getElementById('loginBtn').addEventListener('click', () => toggleAuthForm('loginForm'));
            document.getElementById('signupBtn').addEventListener('click', () => toggleAuthForm('signupForm'));
            
            // Switch between login/signup forms
            document.getElementById('showLogin').addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthForm('loginForm');
            });
            document.getElementById('showSignup').addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthForm('signupForm');
            });
            
            // Forgot password
            document.getElementById('forgotPassword').addEventListener('click', (e) => {
                e.preventDefault();
                showForgotPasswordForm();
            });
            
            document.getElementById('backToLogin').addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthForm('loginForm');
            });
            
            // Form submissions
            document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
            document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
            document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
            document.getElementById('forgotPasswordFormElement').addEventListener('submit', handleForgotPassword);
            
            // Logout button
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            
            // Password toggles
            document.getElementById('toggleLoginPassword').addEventListener('click', () => togglePassword('loginPassword'));
            document.getElementById('toggleSignupPassword').addEventListener('click', () => togglePassword('signupPassword'));
            document.getElementById('toggleSignupConfirmPassword').addEventListener('click', () => togglePassword('signupConfirmPassword'));
            document.getElementById('toggleProfilePassword').addEventListener('click', () => togglePassword('profilePassword'));
            document.getElementById('toggleProfileConfirmPassword').addEventListener('click', () => togglePassword('profileConfirmPassword'));
            document.getElementById('toggleNewUserPassword').addEventListener('click', () => togglePassword('newUserPassword'));
            
            // Sidebar navigation
            document.querySelectorAll('#sidebarMenu a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const contentId = link.getAttribute('data-content') + 'Content';
                    showContent(contentId);
                    
                    // Update active menu item
                    document.querySelectorAll('#sidebarMenu a').forEach(item => {
                        item.classList.remove('active');
                    });
                    link.classList.add('active');
                    
                    // Load specific content if needed
                    if (contentId === 'usersContent') {
                        loadUsersTable();
                    } else if (contentId === 'adminContent') {
                        loadAdminStats();
                    } else if (contentId === 'auditContent') {
                        loadAuditLogs();
                    }
                });
            });
            
            // Admin user management
            document.getElementById('addUserBtn').addEventListener('click', () => {
                showModal('addUserModal');
            });
            
            document.getElementById('cancelAddUser').addEventListener('click', () => {
                hideModal('addUserModal');
            });
            
            document.getElementById('cancelAddUserBtn').addEventListener('click', () => {
                hideModal('addUserModal');
            });
            
            document.getElementById('submitAddUserBtn').addEventListener('click', () => {
                document.getElementById('addUserForm').dispatchEvent(new Event('submit'));
            });
            
            document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
            
            // User search
            document.getElementById('userSearch').addEventListener('input', () => {
                loadUsersTable();
            });
            
            // Pagination
            document.getElementById('prevPageBtn').addEventListener('click', () => {
                const currentPage = parseInt(localStorage.getItem('currentPage') || 1);
                if (currentPage > 1) {
                    localStorage.setItem('currentPage', currentPage - 1);
                    loadUsersTable();
                }
            });
            
            document.getElementById('nextPageBtn').addEventListener('click', () => {
                const currentPage = parseInt(localStorage.getItem('currentPage') || 1);
                const totalPages = Math.ceil(getFilteredUsers().length / 10);
                if (currentPage < totalPages) {
                    localStorage.setItem('currentPage', currentPage + 1);
                    loadUsersTable();
                }
            });
            
            // Audit logs filter
            document.getElementById('applyAuditFilter').addEventListener('click', () => {
                loadAuditLogs();
            });
        }

        // Function to initialize password strength checker
        function initPasswordStrengthChecker() {
            const passwordInput = document.getElementById('signupPassword');
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');
            
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = calculatePasswordStrength(password);
                
                strengthBar.style.width = strength.percentage + '%';
                strengthBar.className = 'password-strength-bar strength-' + strength.class;
                strengthText.textContent = strength.text;
            });
        }

        // Function to calculate password strength
        function calculatePasswordStrength(password) {
            let strength = 0;
            let text = '';
            let className = '';
            
            // Length check
            if (password.length > 0) strength += 10;
            if (password.length >= 8) strength += 20;
            if (password.length >= 12) strength += 20;
            
            // Character variety
            if (/[A-Z]/.test(password)) strength += 10;
            if (/[a-z]/.test(password)) strength += 10;
            if (/[0-9]/.test(password)) strength += 10;
            if (/[^A-Za-z0-9]/.test(password)) strength += 20;
            
            // Cap at 100
            strength = Math.min(strength, 100);
            
            // Determine class and text
            if (strength < 30) {
                className = 'weak';
                text = 'Weak - try adding more characters and variety';
            } else if (strength < 70) {
                className = 'medium';
                text = 'Medium - could be stronger';
            } else {
                className = 'strong';
                text = 'Strong password!';
            }
            
            return {
                percentage: strength,
                class: className,
                text: text
            };
        }

        // Function to toggle password visibility
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const toggle = document.querySelector(`#toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`);
            
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            }
        }

        // Function to toggle between login and signup forms
        function toggleAuthForm(formId) {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('signupForm').classList.add('hidden');
            document.getElementById('forgotPasswordForm').classList.add('hidden');
            document.getElementById(formId).classList.remove('hidden');
            document.getElementById('authForms').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }

        // Function to show forgot password form
        function showForgotPasswordForm() {
            document.getElementById('authForms').classList.add('hidden');
            document.getElementById('forgotPasswordForm').classList.remove('hidden');
        }

        // Function to show modal
        function showModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('show');
        }

        // Function to hide modal
        function hideModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('show');
        }

        // Function to show dashboard
        function showDashboard(user) {
            document.getElementById('authForms').classList.add('hidden');
            document.getElementById('forgotPasswordForm').classList.add('hidden');
            document.getElementById('authButtons').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('userMenu').classList.remove('hidden');
            document.getElementById('usernameDisplay').textContent = user.name;
            document.getElementById('sidebarUserName').textContent = user.name;
            
            // Update user info in dashboard
            document.getElementById('welcomeName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userRoleBadge').innerHTML = user.role === 'admin' 
                ? '<span class="user-role-badge role-admin">Administrator</span>' 
                : '<span class="user-role-badge role-user">Standard User</span>';
            document.getElementById('userRegDate').textContent = new Date(user.registered).toLocaleDateString();
            
            // Update last login time
            document.getElementById('lastLogin').innerHTML = `<i class="fas fa-clock"></i> Last login: ${new Date().toLocaleString()}`;
            
            // Update profile form fields
            document.getElementById('profileName').value = user.name;
            document.getElementById('profileEmail').value = user.email;
            document.getElementById('profileAvatarUrl').value = user.avatarUrl || '';
            
            // Update profile display
            document.getElementById('profileDisplayName').textContent = user.name;
            document.getElementById('profileDisplayRole').textContent = user.role === 'admin' ? 'Administrator' : 'Standard User';
            
            // Update avatar if available
            if (user.avatarUrl) {
                document.getElementById('profileAvatar').src = user.avatarUrl;
            } else {
                const initials = user.name.split(' ').map(n => n[0]).join('');
                document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4361ee&color=fff&size=100`;
            }
            
            // Show admin menu if user is admin
            if (user.role === 'admin') {
                document.querySelectorAll('.admin-menu').forEach(el => el.classList.remove('hidden'));
                loadAdminStats(); // Load admin stats if admin
            } else {
                document.querySelectorAll('.admin-menu').forEach(el => el.classList.add('hidden'));
            }
            
            // Show dashboard content by default
            showContent('dashboardContent');
            document.querySelector('#sidebarMenu a[data-content="dashboard"]').classList.add('active');
        }

        // Function to show specific content area
        function showContent(contentId) {
            document.querySelectorAll('.content > div').forEach(div => {
                div.classList.add('hidden');
            });
            document.getElementById(contentId).classList.remove('hidden');
        }

        // Function to handle login
        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Show loading state
            document.getElementById('loginBtnText').classList.add('hidden');
            document.getElementById('loginSpinner').classList.remove('hidden');
            
            // Simulate API call delay
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    showToast('success', 'Login successful!');
                    
                    // Update last login time
                    user.lastLogin = new Date().toISOString();
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    setTimeout(() => {
                        showDashboard(user);
                        document.getElementById('loginFormElement').reset();
                        logActivity(user.id, 'login', 'User logged in');
                    }, 1000);
                } else {
                    showToast('error', 'Invalid email or password');
                }
                
                // Hide loading state
                document.getElementById('loginBtnText').classList.remove('hidden');
                document.getElementById('loginSpinner').classList.add('hidden');
            }, 1000);
        }

        // Function to handle signup
        function handleSignup(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            if (password !== confirmPassword) {
                showToast('error', 'Passwords do not match');
                return;
            }
            
            // Show loading state
            document.getElementById('signupBtnText').classList.add('hidden');
            document.getElementById('signupSpinner').classList.remove('hidden');
            
            // Simulate API call delay
            setTimeout(() => {
                // Check if user already exists
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    showToast('error', 'Email already registered');
                    document.getElementById('signupBtnText').classList.remove('hidden');
                    document.getElementById('signupSpinner').classList.add('hidden');
                    return;
                }
                
                // Create new user (first user is admin, others are regular users)
                const newUser = {
                    id: Date.now().toString(),
                    name,
                    email,
                    password,
                    role: users.length === 0 ? 'admin' : 'user',
                    registered: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    status: 'active',
                    avatarUrl: ''
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('loggedInUser', JSON.stringify(newUser));
                
                showToast('success', 'Account created successfully!');
                setTimeout(() => {
                    showDashboard(newUser);
                    document.getElementById('signupFormElement').reset();
                    logActivity(newUser.id, 'signup', 'New user registered');
                }, 1000);
                
                // Hide loading state
                document.getElementById('signupBtnText').classList.remove('hidden');
                document.getElementById('signupSpinner').classList.add('hidden');
            }, 1000);
        }

        // Function to handle forgot password
        function handleForgotPassword(e) {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            
            // Show loading state
            const btn = e.target.querySelector('span');
            const spinner = document.getElementById('forgotPasswordSpinner');
            btn.classList.add('hidden');
            spinner.classList.remove('hidden');
            
            // Simulate API call delay
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    showToast('success', 'Password reset link sent to your email');
                    document.getElementById('forgotPasswordFormElement').reset();
                    toggleAuthForm('loginForm');
                } else {
                    showToast('error', 'Email not found');
                }
                
                // Hide loading state
                btn.classList.remove('hidden');
                spinner.classList.add('hidden');
            }, 1500);
        }

        // Function to handle profile update
        function handleProfileUpdate(e) {
            e.preventDefault();
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const name = document.getElementById('profileName').value;
            const avatarUrl = document.getElementById('profileAvatarUrl').value;
            const password = document.getElementById('profilePassword').value;
            const confirmPassword = document.getElementById('profileConfirmPassword').value;
            
            // Show loading state
            const btn = e.target.querySelector('span');
            const spinner = document.getElementById('profileSpinner');
            btn.classList.add('hidden');
            spinner.classList.remove('hidden');
            
            // Validate password if changed
            if (password && password !== confirmPassword) {
                showToast('error', 'Passwords do not match');
                btn.classList.remove('hidden');
                spinner.classList.add('hidden');
                return;
            }
            
            // Update user data
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === loggedInUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].name = name;
                users[userIndex].avatarUrl = avatarUrl;
                if (password) {
                    users[userIndex].password = password;
                }
                
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
                
                showToast('success', 'Profile updated successfully!');
                setTimeout(() => {
                    showDashboard(users[userIndex]);
                    document.getElementById('profileForm').reset();
                    logActivity(users[userIndex].id, 'profile_update', 'Profile updated');
                }, 1000);
            }
            
            // Hide loading state
            btn.classList.remove('hidden');
            spinner.classList.add('hidden');
        }

        // Function to handle logout
        function handleLogout() {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (loggedInUser) {
                logActivity(loggedInUser.id, 'logout', 'User logged out');
            }
            
            localStorage.removeItem('loggedInUser');
            document.getElementById('authButtons').classList.remove('hidden');
            document.getElementById('userMenu').classList.add('hidden');
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('authForms').classList.remove('hidden');
            
            // Reset forms
            document.getElementById('loginFormElement').reset();
            document.getElementById('signupFormElement').reset();
            
            showToast('success', 'Logged out successfully!');
        }

        // Function to handle adding new user (admin only)
        function handleAddUser(e) {
            e.preventDefault();
            const name = document.getElementById('newUserName').value;
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;
            
            // Show loading state
            const btn = document.getElementById('submitAddUserBtn').querySelector('span');
            const spinner = document.getElementById('addUserSpinner');
            btn.classList.add('hidden');
            spinner.classList.remove('hidden');
            
            // Simulate API call delay
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    showToast('error', 'Email already registered');
                    btn.classList.remove('hidden');
                    spinner.classList.add('hidden');
                    return;
                }
                
                const newUser = {
                    id: Date.now().toString(),
                    name,
                    email,
                    password,
                    role,
                    registered: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    status: 'active',
                    avatarUrl: ''
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                hideModal('addUserModal');
                document.getElementById('addUserForm').reset();
                showToast('success', 'User added successfully!');
                loadUsersTable();
                loadAdminStats();
                logActivity(JSON.parse(localStorage.getItem('loggedInUser')).id, 'user_create', `Created user ${email}`);
                
                // Hide loading state
                btn.classList.remove('hidden');
                spinner.classList.add('hidden');
            }, 1000);
        }

        // Function to get filtered users based on search
        function getFilteredUsers() {
            const searchTerm = document.getElementById('userSearch').value.toLowerCase();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            if (!searchTerm) return users;
            
            return users.filter(user => 
                user.name.toLowerCase().includes(searchTerm) || 
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm) ||
                user.status.toLowerCase().includes(searchTerm)
            );
        }

        // Function to load users table (admin only)
        function loadUsersTable() {
            const filteredUsers = getFilteredUsers();
            const currentPage = parseInt(localStorage.getItem('currentPage') || 1);
            const usersPerPage = 10;
            const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
            
            const startIndex = (currentPage - 1) * usersPerPage;
            const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);
            
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';
            
            paginatedUsers.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id.substring(0, 8)}...</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4361ee&color=fff&size=32`}" 
                                 alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%;">
                            ${user.name}
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="user-role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                    <td><span style="color: ${user.status === 'active' ? 'var(--success)' : 'var(--danger)'}">${user.status === 'active' ? 'Active' : 'Suspended'}</span></td>
                    <td>${new Date(user.registered).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-outline btn-sm edit-user-btn" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-user-btn" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
                
                // Add event listeners to buttons
                tr.querySelector('.edit-user-btn').addEventListener('click', () => {
                    editUser(user.id);
                });
                
                tr.querySelector('.delete-user-btn').addEventListener('click', () => {
                    deleteUser(user.id);
                });
            });
            
            // Update pagination info
            document.getElementById('usersShowing').textContent = paginatedUsers.length;
            document.getElementById('usersTotal').textContent = filteredUsers.length;
            
            // Update pagination buttons
            document.getElementById('prevPageBtn').disabled = currentPage === 1;
            document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
        }

        // Function to edit user
        function editUser(userId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.id === userId);
            
            if (user) {
                document.getElementById('editUserId').value = user.id;
                document.getElementById('editUserName').value = user.name;
                document.getElementById('editUserEmail').value = user.email;
                document.getElementById('editUserRole').value = user.role;
                document.getElementById('editUserStatus').value = user.status;
                
                showModal('editUserModal');
                
                // Set up form submission
                document.getElementById('submitEditUserBtn').onclick = function() {
                    const name = document.getElementById('editUserName').value;
                    const email = document.getElementById('editUserEmail').value;
                    const role = document.getElementById('editUserRole').value;
                    const status = document.getElementById('editUserStatus').value;
                    
                    // Show loading state
                    const btn = document.getElementById('submitEditUserBtn').querySelector('span');
                    const spinner = document.getElementById('editUserSpinner');
                    btn.classList.add('hidden');
                    spinner.classList.remove('hidden');
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        const userIndex = users.findIndex(u => u.id === userId);
                        if (userIndex !== -1) {
                            users[userIndex].name = name;
                            users[userIndex].email = email;
                            users[userIndex].role = role;
                            users[userIndex].status = status;
                            
                            localStorage.setItem('users', JSON.stringify(users));
                            
                            // Update logged in user if it's the current user
                            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                            if (loggedInUser && loggedInUser.id === userId) {
                                localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
                                showDashboard(users[userIndex]);
                            }
                            
                            hideModal('editUserModal');
                            showToast('success', 'User updated successfully!');
                            loadUsersTable();
                            logActivity(loggedInUser.id, 'user_update', `Updated user ${email}`);
                        }
                        
                        // Hide loading state
                        btn.classList.remove('hidden');
                        spinner.classList.add('hidden');
                    }, 1000);
                };
            }
        }

        // Function to delete user (admin only)
        function deleteUser(id) {
            if (confirm('Are you sure you want to delete this user?')) {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userToDelete = users.find(u => u.id === id);
                const filteredUsers = users.filter(u => u.id !== id);
                
                // Check if we're deleting ourselves
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                if (loggedInUser && loggedInUser.id === id) {
                    localStorage.removeItem('loggedInUser');
                    handleLogout();
                }
                
                localStorage.setItem('users', JSON.stringify(filteredUsers));
                showToast('success', 'User deleted successfully!');
                loadUsersTable();
                loadAdminStats();
                
                if (userToDelete) {
                    logActivity(loggedInUser.id, 'user_delete', `Deleted user ${userToDelete.email}`);
                }
            }
        }

        // Function to load admin statistics
        function loadAdminStats() {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const activeUsers = users.filter(u => u.status === 'active').length;
            
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('activeUsers').textContent = activeUsers;
            document.getElementById('adminUsers').textContent = users.filter(u => u.role === 'admin').length;
            
            // Load recent activity
            const activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
            const recentActivity = activityLogs.slice(-5).reverse();
            const activityList = document.getElementById('recentActivityList');
            activityList.innerHTML = '';
            
            recentActivity.forEach(log => {
                const user = users.find(u => u.id === log.userId);
                const activityItem = document.createElement('div');
                activityItem.style.padding = '10px';
                activityItem.style.borderBottom = '1px solid var(--light-gray)';
                activityItem.style.display = 'flex';
                activityItem.style.alignItems = 'center';
                activityItem.style.gap = '10px';
                
                let icon = '';
                let color = '';
                
                switch(log.action) {
                    case 'login':
                        icon = 'sign-in-alt';
                        color = 'var(--success)';
                        break;
                    case 'logout':
                        icon = 'sign-out-alt';
                        color = 'var(--danger)';
                        break;
                    case 'create':
                        icon = 'plus-circle';
                        color = 'var(--success)';
                        break;
                    case 'update':
                        icon = 'edit';
                        color = 'var(--warning)';
                        break;
                    case 'delete':
                        icon = 'trash-alt';
                        color = 'var(--danger)';
                        break;
                    default:
                        icon = 'info-circle';
                        color = 'var(--info)';
                }
                
                activityItem.innerHTML = `
                    <div style="color: ${color};">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${user ? user.name : 'System'}</div>
                        <div style="font-size: 0.8rem; color: var(--gray);">${log.details}</div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--gray);">
                        ${new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
        }

        // Function to load audit logs
        function loadAuditLogs() {
            const actionFilter = document.getElementById('auditActionFilter').value;
            const dateFilter = document.getElementById('auditDateFilter').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            let activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
            
            // Apply filters
            if (actionFilter) {
                activityLogs = activityLogs.filter(log => log.action === actionFilter);
            }
            
            if (dateFilter) {
                const filterDate = new Date(dateFilter);
                activityLogs = activityLogs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    return logDate.toDateString() === filterDate.toDateString();
                });
            }
            
            const tbody = document.getElementById('auditTableBody');
            tbody.innerHTML = '';
            
            activityLogs.reverse().forEach(log => {
                const user = users.find(u => u.id === log.userId);
                const tr = document.createElement('tr');
                
                let actionClass = '';
                let actionText = '';
                
                switch(log.action) {
                    case 'login':
                        actionClass = 'role-user';
                        actionText = 'Login';
                        break;
                    case 'logout':
                        actionClass = 'role-user';
                        actionText = 'Logout';
                        break;
                    case 'user_create':
                        actionClass = 'role-admin';
                        actionText = 'Create User';
                        break;
                    case 'user_update':
                        actionClass = 'role-admin';
                        actionText = 'Update User';
                        break;
                    case 'user_delete':
                        actionClass = 'role-admin';
                        actionText = 'Delete User';
                        break;
                    case 'profile_update':
                        actionClass = 'role-user';
                        actionText = 'Profile Update';
                        break;
                    default:
                        actionClass = '';
                        actionText = log.action;
                }
                
                tr.innerHTML = `
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${user ? user.name : 'System'}</td>
                    <td><span class="user-role-badge ${actionClass}">${actionText}</span></td>
                    <td>${log.details}</td>
                    <td>${log.ip || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Function to log activity
        function logActivity(userId, action, details) {
            const activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
            
            activityLogs.push({
                userId,
                action,
                details,
                timestamp: new Date().toISOString(),
                ip: '192.168.1.1' // In a real app, this would be the actual IP
            });
            
            localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
        }

        // Function to show toast notifications
        function showToast(type, message) {
            const toastContainer = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let icon = '';
            switch(type) {
                case 'success':
                    icon = 'check-circle';
                    break;
                case 'error':
                    icon = 'exclamation-circle';
                    break;
                case 'warning':
                    icon = 'exclamation-triangle';
                    break;
                default:
                    icon = 'info-circle';
            }
            
            toast.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            `;
            
            toastContainer.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Function to initialize demo data
        function initializeDemoData() {
            if (!localStorage.getItem('users')) {
                const demoUsers = [
                    {
                        id: '1',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        password: 'admin123',
                        role: 'admin',
                        registered: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        status: 'active',
                        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
                    },
                    {
                        id: '2',
                        name: 'Regular User',
                        email: 'user@example.com',
                        password: 'user123',
                        role: 'user',
                        registered: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        status: 'active',
                        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
                    }
                ];
                
                localStorage.setItem('users', JSON.stringify(demoUsers));
                
                // Initialize activity logs
                const activityLogs = [
                    {
                        userId: '1',
                        action: 'login',
                        details: 'User logged in',
                        timestamp: new Date().toISOString(),
                        ip: '192.168.1.1'
                    },
                    {
                        userId: '2',
                        action: 'login',
                        details: 'User logged in',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        ip: '192.168.1.2'
                    },
                    {
                        userId: '1',
                        action: 'user_create',
                        details: 'Created user user@example.com',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        ip: '192.168.1.1'
                    }
                ];
                
                localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
            }
        }

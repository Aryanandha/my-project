@@ .. @@
 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
-import { supabase } from '../lib/supabaseClient';
 import Header from '../components/Header';
 import { User, Mail, Phone, Briefcase, Lock } from 'lucide-react';
-import { useUser } from '../context/UserContext'; // Import useUser
+import { useUser } from '../context/UserContext';
+import { profileService } from '../services/profileService';
+import { validateProfileData, sanitizeProfileData } from '../utils/validation';
+import { supabase } from '../lib/supabaseClient';

 const roles = [
@@ .. @@
 const RegisterPage: React.FC = () => {
   const navigate = useNavigate();
-  const { setUser } = useUser(); // Use setUser from context
+  const { setUser } = useUser();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     setErrors({});
     
-    const newErrors: Record<string, string> = {};
-
-    // Validation
-    if (!formData.name.trim()) newErrors.name = 'Name is required';
-    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
-    if (!validatePhone(formData.phone)) {
-      newErrors.phone = 'Enter valid 10-digit Indian mobile number (e.g., 9876543210)';
-    }
-    if (!formData.role) newErrors.role = 'Please select a role';
-    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
-    if (formData.password !== formData.confirmPassword) {
-      newErrors.confirmPassword = 'Passwords do not match';
-    }
-
-    setErrors(newErrors);
-
-    if (Object.keys(newErrors).length === 0) {
-      try {
-        console.log('Attempting signup with:', { email: formData.email, password: '****' });
-        // Create user in Supabase Auth with metadata
-        const { data: authData, error: authError } = await supabase.auth.signUp({
-          email: formData.email,
-          password: formData.password,
-          options: {
-            data: {
-              name: formData.name,
-              phone: formData.phone,
-              role: formData.role
-            },
-            emailRedirectTo: undefined // Disable email confirmation for demo
-          }
-        });
-
-        if (authError) {
-          console.error('Auth signup error:', authError.message, authError);
-          setErrors({ general: `Auth error: ${authError.message}` });
-          return;
-        }
-
-        if (authData.user) {
-          console.log('Signup successful, user data:', authData.user);
-          
-          // Check if profile already exists
-          console.log('Creating profile for user:', authData.user.id);
-          const { data: existingProfile } = await supabase
-            .from('profiles')
-            .select('id')
-            .eq('id', authData.user.id)
-            .single();
-
-          // Only create profile if it doesn't exist
-          if (!existingProfile) {
-            const { error: profileError } = await supabase
-              .from('profiles')
-              .insert({
-                id: authData.user.id,
-                name: formData.name,
-                phone: formData.phone,
-                role: formData.role
-              });
-
-            if (profileError) {
-              console.error('Profile creation error:', profileError);
-              setErrors({ general: `Profile creation failed: ${profileError.message}` });
-              return;
-            }
-
-            console.log('Profile created successfully');
-          } else {
-            console.log('Profile already exists, skipping creation');
-          }
-
-          // Set user in context and navigate to dashboard
-          const newUser = {
-            id: authData.user.id,
-            email: authData.user.email!,
-            name: formData.name,
-            phone: formData.phone,
-            role: formData.role
-          };
-          setUser(newUser);
-          console.log('Navigating to dashboard with user:', newUser);
-          navigate('/dashboard');
-        }
-      } catch (error) {
-        console.error('Unexpected registration error:', error);
-        setErrors({ general: 'Registration failed. Please check the console for details.' });
-      }
+    // Validate form data
+    const sanitizedData = sanitizeProfileData(formData);
+    const validation = validateProfileData({ ...sanitizedData, password: formData.password, confirmPassword: formData.confirmPassword });
+    
+    if (!validation.isValid) {
+      setErrors(validation.errors);
+      setLoading(false);
+      return;
+    }
+
+    try {
+      // Create user in Supabase Auth
+      const { data: authData, error: authError } = await supabase.auth.signUp({
+        email: sanitizedData.email,
+        password: formData.password,
+        options: {
+          data: {
+            name: sanitizedData.name,
+            phone: sanitizedData.phone,
+            role: sanitizedData.role
+          }
+        }
+      });
+
+      if (authError) {
+        setErrors({ general: authError.message });
+        return;
+      }
+
+      if (authData.user) {
+        // Create profile using the service
+        try {
+          await profileService.createProfile({
+            name: sanitizedData.name,
+            phone: sanitizedData.phone,
+            role: sanitizedData.role
+          });
+
+          // Set user in context
+          const newUser = {
+            id: authData.user.id,
+            email: authData.user.email!,
+            name: sanitizedData.name,
+            phone: sanitizedData.phone,
+            role: sanitizedData.role
+          };
+          setUser(newUser);
+          navigate('/dashboard');
+        } catch (profileError) {
+          console.error('Profile creation error:', profileError);
+          setErrors({ general: 'Account created but profile setup failed. Please try updating your profile.' });
+          navigate('/profile');
+        }
+      }
+    } catch (error) {
+      console.error('Registration error:', error);
+      setErrors({ general: 'Registration failed. Please try again.' });
+    } finally {
+      setLoading(false);
     }
-    
-    setLoading(false);
   };
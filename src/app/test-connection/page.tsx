'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { signUp, signIn, getCurrentUser, isAuthenticated } from '@/lib/auth';

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`);
        return;
      }
      
      setTestResult('✅ Supabase connection successful! Database is ready.');
      
    } catch (error) {
      setTestResult(`❌ Connection test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEnvironmentVariables = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
      setTestResult('❌ Supabase URL not configured. Please update .env.local');
      return;
    }
    
    if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
      setTestResult('❌ Supabase Anon Key not configured. Please update .env.local');
      return;
    }
    
    setTestResult('✅ Environment variables are configured correctly!');
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    setTestResult('Testing authentication...');
    
    try {
      // Test if we can get current user (should be null if not logged in)
      const user = await getCurrentUser();
      const isLoggedIn = await isAuthenticated();
      
      if (user) {
        setTestResult(`✅ Authentication working! User logged in: ${user.email}`);
      } else {
        setTestResult('✅ Authentication system ready! (No user currently logged in)');
      }
      
    } catch (error) {
      setTestResult(`❌ Authentication test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔧 Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test your Supabase database connection and environment setup
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={testEnvironmentVariables}
                variant="outline" 
                className="w-full"
              >
                🔍 Check Environment Variables
              </Button>
              
              <Button 
                onClick={testSupabaseConnection}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '🔄 Testing...' : '🚀 Test Database Connection'}
              </Button>
              
              <Button 
                onClick={testAuthentication}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? '🔄 Testing...' : '🔐 Test Authentication'}
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
              </div>
            )}
            
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>What this tests:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Environment variables are set correctly</li>
                <li>Supabase URL and key are valid</li>
                <li>Database connection is working</li>
                <li>Database schema is properly set up</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>📋 Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span>1.</span>
                <span>Created Supabase project</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>2.</span>
                <span>Updated .env.local with your credentials</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>3.</span>
                <span>Ran database schema in Supabase SQL editor</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>4.</span>
                <span>Created authentication functions (auth.ts)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>5.</span>
                <span>Tested connection and authentication (this page)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
